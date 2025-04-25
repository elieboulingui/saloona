import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; appointmentId: string; serviceId: string }> },
) {
  try {
    const { barberId, startDate } = await request.json()
    const { id, appointmentId, serviceId  } = await params

    // Vérifier que les paramètres requis sont présents
    if (!barberId || !startDate) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    // Mettre à jour le service de rendez-vous
    const updatedAppointmentService = await prisma.appointmentService.update({
      where: {
        id: serviceId,
        appointmentId: appointmentId,
      },
      data: {
        startDate: new Date(startDate),
        barberId: barberId,
      },
    })

    // Mettre à jour le statut du rendez-vous à INCHAIR s'il n'est pas déjà
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "INCHAIR",
      },
    })

    return NextResponse.json(updatedAppointmentService)

  } catch (error) {
    console.error("Erreur lors du démarrage du service:", error)
    return NextResponse.json({ error: "Erreur lors du démarrage du service" }, { status: 500 })
  }
}
