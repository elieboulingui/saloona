"use server"

import { prisma } from "@/utils/prisma"
import { generateRandomCode } from "@/utils/generateRandomCode"
import { revalidatePath } from "next/cache"
import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"
import { inngest } from "@/inngest/client"

// Types pour les résultats des opérations
export type SaveAppointmentResult = {
  success: boolean
  orderNumber?: number
  hourAppointment?: string
  appointmentId?: string
  createdAt?: Date
  estimatedTime?: number
  error?: string
}

/**
 * Crée un nouveau rendez-vous
 * @param serviceIds IDs des services sélectionnés
 * @param selectedDate Date sélectionnée
 * @param organizationId ID de l'organisation (salon)
 * @param firstName Nom du client
 * @param phoneNumber Numéro de téléphone du client
 * @param status Statut du rendez-vous
 * @param barberId ID du coiffeur sélectionné (peut être null pour "non assigné")
 * @param hourAppointment Heure du rendez-vous sélectionnée par le client
 * @param estimatedTime Temps estimé pour les services en minutes
 * @returns Résultat de l'opération
 */
export async function saveAppointment(
  serviceIds: string[],
  selectedDate: Date,
  organizationId: string,
  firstName: string,
  phoneNumber: string,
  status: AppointmentStatus = AppointmentStatus.PENDING,
  barberId: string | null = null,
  hourAppointment: string,
  estimatedTime?: number,
): Promise<SaveAppointmentResult> {
  try {
    // Normaliser la date (sans l'heure)
    const normalizedDate = new Date(selectedDate)
    normalizedDate.setHours(12, 0, 0, 0)

    // Vérifier si la réservation est pour aujourd'hui et après 17h
    const now = new Date()
    const isToday =
      normalizedDate.getFullYear() === now.getFullYear() &&
      normalizedDate.getMonth() === now.getMonth() &&
      normalizedDate.getDate() === now.getDate()

    if (isToday && now.getHours() >= 17) {
      return {
        success: false,
        error: "Les réservations pour aujourd'hui ne sont plus disponibles après 17h",
      }
    }

    // Définir le début et la fin de la journée pour les requêtes
    const startOfDay = new Date(normalizedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(normalizedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Trouver le dernier numéro de commande pour générer le suivant
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    })

    const newOrderNumber = lastAppointment ? lastAppointment.orderNumber + 1 : 1

    // Si estimatedTime n'est pas fourni, calculer à partir des services
    let finalEstimatedTime = estimatedTime

    if (finalEstimatedTime === undefined) {
      // Récupérer les services et calculer la durée totale estimée
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { durationMin: true, durationMax: true },
      })

      // Calculer la durée totale (moyenne des durées min et max)
      finalEstimatedTime = services.reduce((acc, service) => {
        const avg = Math.round((service.durationMin + service.durationMax) / 2)
        return acc + avg
      }, 0) // total en minutes
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        date: normalizedDate,
        firstName,
        phoneNumber,
        orderNumber: newOrderNumber,
        estimatedTime: finalEstimatedTime, // Convertir en string pour correspondre au modèle
        hourAppointment: hourAppointment,
        status,
        barberId: barberId === "unassigned" ? null : barberId, // Gérer le cas "non assigné"
        organizationId,
      },
    })

    // Créer les relations avec les services
    await prisma.appointmentService.createMany({
      data: serviceIds.map((sid) => ({
        appointmentId: appointment.id,
        serviceId: sid,
      })),
      skipDuplicates: true,
    })

    // Envoyer une notification via Inngest si disponible
    if (typeof inngest !== "undefined" && inngest.send) {
      await inngest.send({
        name: "appointment/created",
        data: {
          appointmentId: appointment.id,
          organizationId,
          firstName,
          phoneNumber,
          orderNumber: newOrderNumber,
          hourAppointment,
          estimatedTime: finalEstimatedTime,
        },
      })
    }

    // Revalider le chemin pour mettre à jour l'UI
    revalidatePath(`/salon/${organizationId}/booking`)

    return {
      success: true,
      orderNumber: newOrderNumber,
      hourAppointment: hourAppointment,
      appointmentId: appointment.id,
      createdAt: appointment.createdAt,
      estimatedTime: finalEstimatedTime,
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du rendez-vous:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la sauvegarde du rendez-vous",
    }
  }
}

/**
 * Supprime un rendez-vous
 * @param appointmentId ID du rendez-vous à supprimer
 * @returns Résultat de l'opération
 */
export async function deleteAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Supprimer d'abord les relations avec les services
    await prisma.appointmentService.deleteMany({
      where: {
        appointmentId,
      },
    })

    // Puis supprimer le rendez-vous
    await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du rendez-vous",
    }
  }
}

/**
 * Met à jour un rendez-vous
 * @param appointmentId ID du rendez-vous à mettre à jour
 * @param firstName Nouveau nom du client
 * @param phoneNumber Nouveau numéro de téléphone
 * @param status Nouveau statut
 * @returns Résultat de l'opération
 */
export async function updateAppointment(
  appointmentId: string,
  firstName: string,
  phoneNumber: string,
  status: AppointmentStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Mettre à jour le rendez-vous
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        firstName,
        phoneNumber,
        status,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du rendez-vous",
    }
  }
}

// Définition des types pour les transactions
export type TransactionType = "APPOINTMENT" | "ORDER" | "WITHDRAWAL"

// Schéma de validation pour la création d'une transaction
const createTransactionSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  reference: z.string().min(1, "La référence est requise"),
  shortDescription: z.string().min(1, "La description courte est requise"),
  payerMsisdn: z.string().min(1, "Le numéro de téléphone est requis"),
  payerEmail: z.string().email("L'email doit être valide"),
  type: z.enum(["APPOINTMENT", "ORDER", "WITHDRAWAL"]),
  appointmentId: z.string().optional(),
  orderId: z.string().optional(),
  bill_id: z.string().optional(),
  server_transaction_id: z.string().optional(),
  status: z.string().optional().default("pending"),
  organizationId: z.string().min(1, "L'ID de l'organisation est requis"),
})

// Type pour les résultats des opérations de transaction
type TransactionResult = {
  success: boolean
  data?: any
  error?: string
}

/**
 * Crée une nouvelle transaction
 * @param data Données de la transaction
 * @returns Résultat de l'opération
 */
export async function createTransaction(data: z.infer<typeof createTransactionSchema>): Promise<TransactionResult> {
  try {
    // Valider les données
    const validatedData = createTransactionSchema.parse(data)

    // Vérifier si une transaction avec la même référence existe déjà
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: validatedData.reference },
    })

    if (existingTransaction) {
      return {
        success: false,
        error: "Une transaction avec cette référence existe déjà",
      }
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        reference: validatedData.reference,
        shortDescription: validatedData.shortDescription,
        payerMsisdn: validatedData.payerMsisdn,
        payerEmail: validatedData.payerEmail,
        type: validatedData.type,
        appointmentId: validatedData.appointmentId,
        orderId: validatedData.orderId,
        bill_id: validatedData.bill_id || generateRandomCode(),
        server_transaction_id: validatedData.server_transaction_id,
        status: validatedData.status,
        organizationId: validatedData.organizationId,
      },
    })

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
      }
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la transaction",
    }
  }
}

/**
 * Met à jour le statut d'une transaction et du rendez-vous associé
 * @param transactionId ID de la transaction
 * @param status Nouveau statut
 * @param appointmentId ID du rendez-vous associé
 * @param clientName Nom du client
 * @param phoneNumber Numéro de téléphone du client
 * @param appointmentStatus Nouveau statut du rendez-vous
 * @returns Résultat de l'opération
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: string,
  appointmentId: string,
  clientName: string,
  phoneNumber: string,
  appointmentStatus: AppointmentStatus,
): Promise<TransactionResult> {
  try {
    // Vérifier si la transaction existe
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!existingTransaction) {
      return {
        success: false,
        error: "Transaction non trouvée",
      }
    }

    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Mettre à jour le rendez-vous
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        firstName: clientName,
        phoneNumber: phoneNumber,
        status: appointmentStatus,
      },
      include: {
        services: true, // Inclure les informations des services
      },
    })

    // Mettre à jour la transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    })

    // Envoyer une notification via Inngest si disponible
    if (typeof inngest !== "undefined" && inngest.send) {
      await inngest.send({
        name: "transaction/status.updated",
        data: {
          transactionId,
          status,
          appointmentId,
          clientName,
          phoneNumber,
          appointmentStatus,
          serviceName: appointment.services[0]?.serviceId || "Service",
        },
      })
    }

    // Revalider les chemins potentiellement affectés
    if (existingTransaction.appointmentId) {
      revalidatePath(`/tv`)
      revalidatePath(`/salon/${existingTransaction.organizationId}/booking`)
    }

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la transaction:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du statut de la transaction",
    }
  }
}
