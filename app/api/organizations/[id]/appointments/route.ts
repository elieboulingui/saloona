import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfDay, endOfDay, format } from "date-fns"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
try {

  const { id } = await params
  
    // Obtenir la date d'aujourd'hui
    const today = new Date()

    // Utiliser date-fns pour obtenir le début et la fin de la journée
    const dayStart = startOfDay(today)
    const dayEnd = endOfDay(today)

    console.log(
      "Recherche des rendez-vous entre:",
      format(dayStart, "yyyy-MM-dd HH:mm:ss"),
      "et",
      format(dayEnd, "yyyy-MM-dd HH:mm:ss"),
    )

    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["CONFIRMED", "INCHAIR", "COMPLETED"] },
        // Utiliser une plage de dates pour capturer tous les rendez-vous du jour
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        organizationId : id
      },
      include: {
        service: true,
      },
      orderBy: { orderNumber: "asc" }, // Trier par ordre de passage
    })

    console.log("Rendez-vous trouvés:", appointments.length)

    // Afficher les dates des rendez-vous trouvés pour le débogage
    appointments.forEach((appointment, index) => {
      console.log(
        `Rendez-vous ${index + 1}:`,
        format(new Date(appointment.date), "yyyy-MM-dd HH:mm:ss"),
        "Status:",
        appointment.status,
        "Ordre:",
        appointment.orderNumber,
      )
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erreur API /appointments:", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
