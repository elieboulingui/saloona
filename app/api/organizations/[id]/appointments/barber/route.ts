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
    const barberIdParam = searchParams.get("barberId")
  

    if (!dateParam || !barberIdParam || !id) {
      return NextResponse.json({ error: "Date, barberId et OrganisationId sont requis" }, { status: 400 })
    }

    // Convertir le paramètre de date en objet Date
    const selectedDate = parseISO(dateParam)

    // Obtenir le début et la fin de la journée
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    console.log(
      "Recherche des rendez-vous entre:",
      format(dayStart, "yyyy-MM-dd HH:mm:ss"),
      "et",
      format(dayEnd, "yyyy-MM-dd HH:mm:ss"),
      "pour le coiffeur:",
      barberIdParam,
      "dans l'organisation:",
      id,
    )

    // Récupérer tous les rendez-vous pour la date et le coiffeur sélectionnés
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        barberId: barberIdParam,
        organizationId: id,
      },
      include: {
        services : {
          include : {
            service: true
          }
        },
      },
      orderBy: {
        estimatedTime: "asc",
      },
    })

    console.log(
      `Trouvé ${appointments.length} rendez-vous pour la date ${dateParam}, le coiffeur ${barberIdParam} et l'organisation ${id}`,
    )

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous par coiffeur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des rendez-vous" },
      { status: 500 },
    )
  }
}
