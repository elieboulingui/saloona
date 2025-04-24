import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfMonth, endOfMonth, format } from "date-fns"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const {id : organizationId} = await params
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM")

    // Parse the month parameter (format: yyyy-MM)
    const [year, month] = monthParam.split("-").map(Number)
    const date = new Date(year, month - 1) // month is 0-indexed in JS Date

    // Get start and end of the month
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    // Récupérer tous les rendez-vous du mois
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        date: true,
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des rendez-vous" },
      { status: 500 },
    )
  }
}
