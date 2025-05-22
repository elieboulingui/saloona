import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { parseISO, startOfDay, endOfDay, format } from "date-fns"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
  try {
  
    const { id } = await params

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Convertir le paramètre de date en objet Date avec date-fns
    const selectedDate = parseISO(dateParam)

    // Utiliser date-fns pour obtenir le début et la fin de la journée
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    console.log(
      "Recherche des rendez-vous entre:",
      format(dayStart, "yyyy-MM-dd HH:mm:ss"),
      "et",
      format(dayEnd, "yyyy-MM-dd HH:mm:ss"),
    )

    // Récupérer tous les rendez-vous pour la date sélectionnée
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: id,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        services: {
            include :{
                service : true
            }
        },
      },
      orderBy: {
        estimatedTime: "asc",
      },
    })

    return NextResponse.json(appointments)
    
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous par date:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des rendez-vous" },
      { status: 500 },
    )
  }
}
