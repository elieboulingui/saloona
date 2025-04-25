import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { format } from "date-fns"

export async function GET(request: Request) {
  try {
    
    const { searchParams } = new URL(request.url)
    const barberIdParam = searchParams.get("barberId")

    if (!barberIdParam) {
      return NextResponse.json({ error: "barberId est requis" }, { status: 400 })
    }

    // Récupérer tous les rendez-vous du coiffeur
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: barberIdParam,
      },
      select: {
        date: true,
      },
      distinct: ["date"],
    })

    // Afficher les dates des rendez-vous trouvés pour le débogage
    appointments.forEach((appointment, index) => {
      console.log(`Date ${index + 1}:`, format(new Date(appointment.date), "yyyy-MM-dd"))
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erreur lors de la récupération des dates de rendez-vous par coiffeur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des dates de rendez-vous" },
      { status: 500 },
    )
  }
}
