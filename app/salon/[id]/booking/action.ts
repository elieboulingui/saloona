"use server"

import { prisma } from "@/utils/prisma"
import { generateRandomCode } from "@/utils/generateRandomCode"
import { revalidatePath } from "next/cache"
import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"
import { inngest } from "@/inngest/client"

type SaveAppointmentResult = {
  success: boolean
  orderNumber: number
  estimatedTime: string
  appointmentId?: string
  createdAt?: Date
  error?: string
}

export async function saveAppointment(
  serviceIds: string[], // Accept multiple services
  selectedDate: Date,
  organizationId: string, // Required!
  firstName: string = generateRandomCode(),
  phoneNumber:string,
  status: AppointmentStatus = AppointmentStatus.PENDING,
  barberId?: string,
): Promise<SaveAppointmentResult> {
  try {

    console.log(serviceIds)

    const normalizedDate = new Date(selectedDate)
    normalizedDate.setHours(12, 0, 0, 0)

    const now = new Date()

    const isToday =
      normalizedDate.getFullYear() === now.getFullYear() &&
      normalizedDate.getMonth() === now.getMonth() &&
      normalizedDate.getDate() === now.getDate()

    if (isToday && now.getHours() >= 17) {
      console.log("hello")
      return {
        success: false,
        orderNumber: 0,
        estimatedTime: "",
        error: "Les réservations pour aujourd'hui ne sont plus disponibles après 17h",
      }
    }

    const startOfDay = new Date(normalizedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(normalizedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    })

    const newOrderNumber = lastAppointment ? lastAppointment.orderNumber + 1 : 1

    const startHour = 9
    let estimatedHour = startHour
    let estimatedMinutes = 0

    const lastValidAppointment = await prisma.appointment.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        OR: [
          { status: { not: AppointmentStatus.PENDING } },
          { createdAt: { gte: new Date(now.getTime() - 5 * 60000) } },
        ],
      },
      orderBy: { orderNumber: "desc" },
      select: { estimatedTime: true },
    })

    if (lastValidAppointment) {
      const [lastHour, lastMin] = lastValidAppointment.estimatedTime.split(":").map(Number)
      estimatedHour = lastHour
      estimatedMinutes = lastMin
      if (estimatedMinutes >= 60) {
        estimatedHour += Math.floor(estimatedMinutes / 60)
        estimatedMinutes %= 60
      }
    }

    const formattedHour = estimatedHour.toString().padStart(2, "0")
    const formattedMinutes = estimatedMinutes.toString().padStart(2, "0")
    const estimatedTime = `${formattedHour}:${formattedMinutes}`

    // Création du rendez-vous principal
    const appointment = await prisma.appointment.create({
      data: {
        date: normalizedDate,
        firstName,
        phoneNumber,
        orderNumber: newOrderNumber,
        estimatedTime,
        status,
        barberId,
        organizationId,
      },
    })

    // Création des liaisons AppointmentService
    await prisma.appointmentService.createMany({
      data: serviceIds.map((sid) => ({
        appointmentId: appointment.id,
        serviceId: sid,
      })),
      skipDuplicates: true,
    })

    return {
      success: true,
      orderNumber: newOrderNumber,
      estimatedTime,
      appointmentId: appointment.id,
      createdAt: appointment.createdAt,
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du rendez-vous:", error)
    return {
      success: false,
      orderNumber: 0,
      estimatedTime: "",
      error: "Une erreur est survenue lors de la sauvegarde du rendez-vous",
    }
  }
}


type DeleteAppointmentResult = {
  success: boolean
  error?: string
}

export async function deleteAppointment(appointmentId: string): Promise<DeleteAppointmentResult> {
  try {
    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Supprimer le rendez-vous de la base de données
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

export async function updateAppointment(
  appointmentId: string,
  firstName: string,
  phoneNumber: string,
  status: AppointmentStatus,
) {
  try {
    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Supprimer le rendez-vous de la base de données
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        firstName: firstName,
        phoneNumber: phoneNumber,
        status: status,
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

// Schéma de validation pour la mise à jour d'une transaction
const updateTransactionSchema = z.object({
  id: z.string().min(1, "L'ID de la transaction est requis"),
  amount: z.number().positive("Le montant doit être positif").optional(),
  reference: z.string().min(1, "La référence est requise").optional(),
  shortDescription: z.string().min(1, "La description courte est requise").optional(),
  payerMsisdn: z.string().min(1, "Le numéro de téléphone est requis").optional(),
  payerEmail: z.string().email("L'email doit être valide").optional(),
  type: z.enum(["APPOINTMENT", "ORDER", "WITHDRAWAL"]).optional(),
  appointmentId: z.string().optional(),
  orderId: z.string().optional(),
  bill_id: z.string().optional(),
  server_transaction_id: z.string().optional(),
  status: z.string().optional(),
})

// Type pour les résultats des opérations
type TransactionResult = {
  success: boolean
  data?: any
  error?: string
}

/**
 * Crée une nouvelle transaction
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
        amount: 1000,
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

    // Revalider les chemins potentiellement affectés

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
 * Met à jour une transaction existante
 */
export async function updateTransaction(data: z.infer<typeof updateTransactionSchema>): Promise<TransactionResult> {
  try {
    // Valider les données
    const validatedData = updateTransactionSchema.parse(data)

    // Vérifier si la transaction existe
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: validatedData.id },
    })

    if (!existingTransaction) {
      return {
        success: false,
        error: "Transaction non trouvée",
      }
    }

    // Mettre à jour la transaction
    const transaction = await prisma.transaction.update({
      where: { id: validatedData.id },
      data: {
        amount: 1000,
        reference: validatedData.reference,
        shortDescription: validatedData.shortDescription,
        payerMsisdn: validatedData.payerMsisdn,
        payerEmail: validatedData.payerEmail,
        type: validatedData.type,
        appointmentId: validatedData.appointmentId,
        orderId: validatedData.orderId,
        bill_id: validatedData.bill_id,
        server_transaction_id: validatedData.server_transaction_id,
        status: validatedData.status,
      },
    })

    // Revalider les chemins potentiellement affectés
    if (existingTransaction.appointmentId) {
      revalidatePath(`/services/[id]/boooking`)
    }
    if (existingTransaction.orderId) {
      revalidatePath(`/boutique`)
    }

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la transaction:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
      }
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la transaction",
    }
  }
}

/**
 * Récupère une transaction par son ID
 */
export async function getTransactionById(id: string): Promise<TransactionResult> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return {
        success: false,
        error: "Transaction non trouvée",
      }
    }

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la transaction:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération de la transaction",
    }
  }
}

/**
 * Récupère une transaction par sa référence
 */
export async function getTransactionByReference(reference: string): Promise<TransactionResult> {
  try {

    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    })

    if (!transaction) {
      return {
        success: false,
        error: "Transaction non trouvée",
      }
    }

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la transaction:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération de la transaction",
    }
  }
}

// Modifier la fonction updateTransactionStatus pour appeler la fonction Inngest
export async function updateTransactionStatus(
  id: string,
  status: string,
  appointmentId: string,
  clientName: string,
  phoneNumber: string,
  appointmentStatus: AppointmentStatus,
): Promise<TransactionResult> {
  try {
    console.log(id)

    // Vérifier si la transaction existe
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    // Vérifier si l'ID du rendez-vous est fourni
    if (!appointmentId) {
      return {
        success: false,
        error: "ID du rendez-vous non fourni",
      }
    }

    // Mettre à jour le rendez-vous dans la base de données
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
        services: true, // Inclure les informations du service
      },
    })

    if (!existingTransaction) {
      console.log("Transaction non trouvée")
      return {
        success: false,
        error: "Transaction non trouvée",
      }
    }

    // Mettre à jour le statut de la transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status: status },
    })

    // Envoyer une notification via Inngest
    await inngest.send({
      name: "transaction/status.updated",
      data: {
        transactionId: id,
        status: status,
        appointmentId: appointmentId,
        clientName: clientName,
        phoneNumber: phoneNumber,
        appointmentStatus: appointmentStatus,
        serviceName: appointment.services[0]?.id || "Service",
      },
    })

    // Revalider les chemins potentiellement affectés
    if (existingTransaction.appointmentId) {
      revalidatePath(`/tv`)
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
