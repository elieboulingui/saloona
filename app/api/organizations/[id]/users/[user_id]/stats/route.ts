import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfDay, endOfDay, parseISO, subDays, format, differenceInMinutes } from "date-fns"

export async function GET(request: Request, { params }: { params: Promise<{ id: string , user_id : string}> }) {
  try {
    const { id:organizationId , user_id : userId} = await params
    
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

  // Définir la plage de dates par défaut (30 derniers jours) si non spécifiée
  const now = new Date()
  const defaultStartDate = new Date(now)
  defaultStartDate.setDate(defaultStartDate.getDate() - 30)

  const startDate = startDateParam ? startOfDay(parseISO(startDateParam)) : startOfDay(defaultStartDate)
  const endDate = endDateParam ? endOfDay(parseISO(endDateParam)) : endOfDay(now)

  // 1. Récupérer tous les services du coiffeur dans la plage de dates
  const appointmentServices = await prisma.appointmentService.findMany({
    where: {
      barberId: userId,
      appointment: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      // S'assurer que le service a été commencé et terminé
      startDate: { not: null },
      endDate: { not: null },
    },
    include: {
      service: true,
      appointment: true,
    },
    orderBy: {
      startDate: "asc",
    },
  })

  // 2. Calculer les statistiques globales
  const totalAppointments = new Set(appointmentServices.map((as) => as.appointmentId)).size

  // Calculer la durée totale et moyenne des services
  let totalDuration = 0
  appointmentServices.forEach((as) => {
    if (as.startDate && as.endDate) {
      const duration = differenceInMinutes(new Date(as.endDate), new Date(as.startDate))
      totalDuration += duration
    }
  })

  const avgDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0

  // 3. Calculer les statistiques par service
  const serviceStats: Record<
    string,
    {
      serviceId: string
      serviceName: string
      count: number
      totalDuration: number
      avgDuration: number
    }
  > = {}

  appointmentServices.forEach((as) => {
    if (as.startDate && as.endDate && as.service) {
      const duration = differenceInMinutes(new Date(as.endDate), new Date(as.startDate))

      if (!serviceStats[as.serviceId]) {
        serviceStats[as.serviceId] = {
          serviceId: as.serviceId,
          serviceName: as.service.name,
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
        }
      }

      serviceStats[as.serviceId].count += 1
      serviceStats[as.serviceId].totalDuration += duration
    }
  })

  // Calculer la durée moyenne pour chaque service
  Object.values(serviceStats).forEach((stat) => {
    stat.avgDuration = stat.count > 0 ? stat.totalDuration / stat.count : 0
  })

  // 4. Calculer les statistiques par jour
  const dailyStats: Record<string, { date: string; count: number }> = {}

  appointmentServices.forEach((as) => {
    if (as.startDate) {
      const dateKey = format(new Date(as.startDate), "yyyy-MM-dd")

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          count: 0,
        }
      }

      dailyStats[dateKey].count += 1
    }
  })

  // 5. Préparer la réponse
  const response = {
    totalAppointments,
    totalDuration,
    avgDuration,
    serviceStats: Object.values(serviceStats).sort((a, b) => b.count - a.count),
    dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
  }

  return NextResponse.json(response)
    
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des statistiques de l'utilisateur" },
      { status: 500 },
    )
  }
}
