import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfDay, endOfDay, parseISO, subDays, format } from "date-fns"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
try {

    const { id } = await params
    
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Définir la période par défaut (7 derniers jours)
    const endDate = endDateParam ? parseISO(endDateParam) : new Date()
    const startDate = startDateParam ? parseISO(startDateParam) : subDays(endDate, 6)

    // Préparer les données pour le graphique
    const revenues = []
    const withdrawals = []

    for (let i = 0; i < 7; i++) {
      const currentDate = subDays(endDate, 6 - i)
      const dayStart = startOfDay(currentDate)
      const dayEnd = endOfDay(currentDate)
      const dateString = format(currentDate, "yyyy-MM-dd")

      // Calculer les revenus pour ce jour
      const dailyRevenues = await prisma.transaction.aggregate({
        where: {
          organizationId: id,
          type: { in: ["APPOINTMENT", "ORDER"] },
          status: { in: ["paid", "processed"] },
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      // Calculer les retraits pour ce jour
      const dailyWithdrawals = await prisma.transaction.aggregate({
        where: {
          organizationId: id,
          type: "WITHDRAWAL",
          status: { in: ["paid", "processed"] },
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      revenues.push(dailyRevenues._sum.amount || 0)
      withdrawals.push(dailyWithdrawals._sum.amount || 0)
    }

    return NextResponse.json({ revenues, withdrawals })
  } catch (error) {
    console.error("Erreur lors de la récupération des données du graphique financier:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des données" }, { status: 500 })
  }
}
