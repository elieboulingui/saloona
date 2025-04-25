import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; appointmentId: string; serviceId: string }> },
) {
  try {
    const { endDate } = await request.json()
    const {id , appointmentId, serviceId} = await params

    // Vérifier que les paramètres requis sont présents
    if (!endDate) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    // Mettre à jour le service de rendez-vous
    const updatedAppointmentService = await prisma.appointmentService.update({
      where: {
        id: serviceId,
      },
      data: {
        endDate: new Date(endDate),
      },
    })

    // Vérifier si tous les services du rendez-vous sont terminés
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        services: true,
      },
    })

    // Si tous les services ont une date de fin, marquer le rendez-vous comme terminé
    if (appointment && appointment.services.every((service) => service.endDate)) {
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          status: "COMPLETED",
        },
      })
    }

    return NextResponse.json(updatedAppointmentService)
  } catch (error) {
    console.error("Erreur lors de la finalisation du service:", error)
    return NextResponse.json({ error: "Erreur lors de la finalisation du service" }, { status: 500 })
  }
}
