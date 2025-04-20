import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfDay, endOfDay, parseISO, format } from "date-fns"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
try {

  const { id } = await params
  
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const typeParam = searchParams.get("type")
    const statusParam = searchParams.get("status")

    // Construire les conditions de filtrage
    const where: any = {
      organizationId: id,
    }

    // Filtrage par date
    if (startDateParam && endDateParam) {
      const startDate = startOfDay(parseISO(startDateParam))
      const endDate = endOfDay(parseISO(endDateParam))

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }

      console.log(
        "Filtrage par date:",
        format(startDate, "yyyy-MM-dd HH:mm:ss"),
        "à",
        format(endDate, "yyyy-MM-dd HH:mm:ss"),
      )
    }

    // Filtrage par type
    if (typeParam) {
      where.type = typeParam
      console.log("Filtrage par type:", typeParam)
    }

    // Filtrage par statut
    if (statusParam) {
      where.status = statusParam
      console.log("Filtrage par statut:", statusParam)
    }

    // Récupérer toutes les transactions selon les filtres
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Enrichir les transactions avec les données associées
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        let appointmentData = null
        let orderData = null

        // Si la transaction est liée à un rendez-vous, récupérer les données du rendez-vous
        if (transaction.appointmentId) {
          appointmentData = await prisma.appointment.findUnique({
            where: { id: transaction.appointmentId },
            include: { services : true },
          })
        }

        // Si la transaction est liée à une commande, récupérer les données de la commande
        if (transaction.orderId) {
          orderData = await prisma.order.findUnique({
            where: { id: transaction.orderId },
            include: {
              orderItems: {
                include: { product: true },
              },
            },
          })
        }

        return {
          ...transaction,
          appointment: appointmentData,
          order: orderData,
        }
      }),
    )

    // Calculer le cash flow total (entrées d'argent)
    const cashFlowTotal = await prisma.transaction.aggregate({
      where: {
        organizationId: id,
        type: { in: ["APPOINTMENT", "ORDER"] },
        status: { in: ["paid", "processed"] },
      },
      _sum: {
        amount: true,
      },
    })

    // Calculer le total des retraits
    const withdrawalsTotal = await prisma.transaction.aggregate({
      where: {
        organizationId: id,
        type: "WITHDRAWAL",
        status: { in: ["paid", "processed"] },
      },
      _sum: {
        amount: true,
      },
    })

    // Calculer le solde actuel
    const totalIncome = cashFlowTotal._sum.amount || 0
    const totalWithdrawals = withdrawalsTotal._sum.amount || 0
    const currentBalance = totalIncome - totalWithdrawals

    // Récupérer les statistiques par type de transaction
    const appointmentStats = await prisma.transaction.aggregate({
      where: {
        organizationId: id,
        type: "APPOINTMENT",
        status: { in: ["paid", "processed"] },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    const orderStats = await prisma.transaction.aggregate({
      where: {
        organizationId: id,
        type: "ORDER",
        status: { in: ["paid", "processed"] },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    const withdrawalStats = await prisma.transaction.aggregate({
      where: {
        organizationId: id,
        type: "WITHDRAWAL",
        status: { in: ["paid", "processed"] },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Récupérer les statistiques par statut
    const statusStats = await Promise.all(
      ["pending", "paid", "processed", "failed", "expired", "cancelled"].map(async (status) => {
        const stats = await prisma.transaction.aggregate({
          where: {
            organizationId: id,
            status,
          },
          _sum: {
            amount: true,
          },
          _count: true,
        })
        return {
          status,
          count: stats._count,
          amount: stats._sum.amount || 0,
        }
      }),
    )

    // Retourner les données
    return NextResponse.json({
      financialSummary: {
        cashFlowTotal: totalIncome,
        withdrawalsTotal: totalWithdrawals,
        currentBalance,
      },
      statistics: {
        byType: {
          APPOINTMENT: {
            count: appointmentStats._count,
            amount: appointmentStats._sum.amount || 0,
          },
          ORDER: {
            count: orderStats._count,
            amount: orderStats._sum.amount || 0,
          },
          WITHDRAWAL: {
            count: withdrawalStats._count,
            amount: withdrawalStats._sum.amount || 0,
          },
        },
        byStatus: statusStats.reduce(
          (acc, stat) => {
            acc[stat.status] = {
              count: stat.count,
              amount: stat.amount,
            }
            return acc
          },
          {} as Record<string, { count: number; amount: number }>,
        ),
      },
      transactions: enrichedTransactions,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des données admin:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des données" }, { status: 500 })
  }
}
