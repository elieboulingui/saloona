import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"


// Fonction pour récupérer un rendez-vous spécifique d'une organisation
export async function GET(request: Request, { params }: { params: Promise<{ id: string; appointmentId: string }> }) {
  try {
    const { id: organizationId, appointmentId } = await params
    
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous non trouvé" }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Erreur lors de la récupération du rendez-vous:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du rendez-vous" }, { status: 500 })
  }
}


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; appointmentId: string }> }) {
  try {
    const { id: organizationId, appointmentId } = await params
    const body = await request.json()

    // Vérifier que le rendez-vous existe et appartient à l'organisation
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        organizationId,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé ou n'appartient pas à cette organisation" },
        { status: 404 },
      )
    }

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        firstName: body.firstName || undefined,
        phoneNumber: body.phoneNumber || undefined,
        date: body.date ? new Date(body.date) : undefined,
        hourAppointment: body.hourAppointment || undefined, // Ajout du champ hourAppointment
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        barberId: body.barberId !== undefined ? body.barberId : undefined,
        status: body.status || undefined,
        estimatedTime: body.estimatedTime || undefined,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    // Si des services sont fournis, mettre à jour les services du rendez-vous
    if (body.serviceIds && Array.isArray(body.serviceIds)) {
      // Supprimer les services existants
      await prisma.appointmentService.deleteMany({
        where: {
          appointmentId,
        },
      })

      // Ajouter les nouveaux services
      await prisma.appointmentService.createMany({
        data: body.serviceIds.map((serviceId: string) => ({
          appointmentId,
          serviceId,
        })),
        skipDuplicates: true,
      })

      // Récupérer le rendez-vous mis à jour avec les nouveaux services
      const appointmentWithServices = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      })

      return NextResponse.json(appointmentWithServices)
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du rendez-vous" },
      { status: 500 },
    )
  }
}
