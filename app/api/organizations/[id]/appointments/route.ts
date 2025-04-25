import { type NextRequest, NextResponse } from "next/server"
import { checkOrganizationMembership } from "@/lib/check-organization-membership"
import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"

// GET /api/organizations/[id]/appointments
export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
try {

    const { id } = await params
  
    const session = await auth()

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est membre de l'organisation
    const organizationId = id
    const canAccess = await checkOrganizationMembership(organizationId)

    if (!canAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer tous les rendez-vous de l'organisation
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                durationMin: true,
                durationMax: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Transformer les données pour faciliter l'utilisation côté client
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      firstName: appointment.firstName,
      phoneNumber: appointment.phoneNumber,
      date: appointment.date,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      orderNumber: appointment.orderNumber,
      hourAppointment: appointment.hourAppointment,
      estimatedTime: appointment.estimatedTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      organizationId: appointment.organizationId,
      barberId: appointment.barberId,
      services: appointment.services.map((as) => as.service),
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des rendez-vous" }, { status: 500 })
  }
}

// Mise à jour de la partie POST de la route
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const {id : organizationId} = await params
    const data = await request.json()

    // Validation des données
    if (
      !data.firstName ||
      !data.phoneNumber ||
      !data.date ||
      !data.serviceIds ||
      data.serviceIds.length === 0 ||
      !data.hourAppointment
    ) {
      return NextResponse.json({ error: "Données manquantes pour créer un rendez-vous" }, { status: 400 })
    }

    // Calculer le numéro d'ordre pour la journée
    const appointmentsCount = await prisma.appointment.count({
      where: {
        organizationId: organizationId,
        date: {
          gte: new Date(new Date(data.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(data.date).setHours(23, 59, 59, 999)),
        },
      },
    })

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        firstName: data.firstName,
        phoneNumber: data.phoneNumber,
        date: new Date(data.date),
        hourAppointment: data.hourAppointment, // Ajout du champ hourAppointment
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        orderNumber: appointmentsCount + 1,
        estimatedTime: data.estimatedTime || 30, // Valeur par défaut de 30 minutes
        status: data.status || "PENDING",
        organization: {
          connect: { id: organizationId },
        },
        barber:
          data.barberId && data.barberId !== "unassigned"
            ? {
                connect: { id: data.barberId },
              }
            : undefined,
      },
    })

    // Ajouter les services au rendez-vous
    const serviceConnections = await Promise.all(
      data.serviceIds.map((serviceId: string) =>
        prisma.appointmentService.create({
          data: {
            appointment: {
              connect: { id: appointment.id },
            },
            service: {
              connect: { id: serviceId },
            },
          },
          include: {
            service: true,
          },
        }),
      ),
    )

    // Récupérer le rendez-vous complet avec ses relations
    const completeAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointment.id,
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                durationMin: true,
                durationMax: true,
                image: true,
              },
            },
          },
        },
      },
    })

    // Transformer les données pour faciliter l'utilisation côté client
    const formattedAppointment = {
      ...completeAppointment,
      services: completeAppointment?.services.map((as) => as.service) || [],
    }

    return NextResponse.json(formattedAppointment)
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error)
    return NextResponse.json({ error: "Erreur lors de la création du rendez-vous" }, { status: 500 })
  }
}