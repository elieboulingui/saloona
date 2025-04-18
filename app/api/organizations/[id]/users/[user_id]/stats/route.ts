import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { startOfDay, endOfDay, parseISO, subDays } from "date-fns"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string , user_id : string}> }
  ) {
  try {
  
      const { id , user_id} = await params

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Définir la période par défaut (30 derniers jours) si non spécifiée
    const endDate = endDateParam ? parseISO(endDateParam) : new Date()
    const startDate = startDateParam ? parseISO(startDateParam) : subDays(endDate, 30)

    // Récupérer tous les rendez-vous terminés pour l'utilisateur dans la période
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: id,
        status: "COMPLETED",
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      include: {
        service: true,
      },
    })

    // Calculer les statistiques par service
    const serviceStats: Record<
      string,
      {
        count: number
        totalDuration: number
        avgDuration: number
        serviceName: string
        serviceId: string
      }
    > = {}

    appointments.forEach((appointment) => {
      const serviceId = appointment.serviceId

      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          serviceName: appointment.service.name,
          serviceId: serviceId,
        }
      }

      // Calculer la durée moyenne entre min et max du service
      const avgServiceDuration = (appointment.service.durationMin + appointment.service.durationMax) / 2

      serviceStats[serviceId].count += 1
      serviceStats[serviceId].totalDuration += avgServiceDuration
    })

    // Calculer la durée moyenne pour chaque service
    Object.keys(serviceStats).forEach((serviceId) => {
      serviceStats[serviceId].avgDuration = serviceStats[serviceId].totalDuration / serviceStats[serviceId].count
    })

    // Convertir en tableau pour faciliter l'utilisation côté client
    const serviceStatsArray = Object.values(serviceStats)

    // Calculer les statistiques globales
    const totalAppointments = appointments.length
    const totalDuration = serviceStatsArray.reduce((sum, stat) => sum + stat.totalDuration, 0)
    const avgDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0

    // Calculer les statistiques par jour
    const dailyStats: Record<string, { date: string; count: number }> = {}

    appointments.forEach((appointment) => {
      const dateStr = appointment.date.toISOString().split("T")[0]

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          count: 0,
        }
      }

      dailyStats[dateStr].count += 1
    })

    // Convertir en tableau pour faciliter l'utilisation côté client
    const dailyStatsArray = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalAppointments,
      totalDuration,
      avgDuration,
      serviceStats: serviceStatsArray,
      dailyStats: dailyStatsArray,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des statistiques de l'utilisateur" },
      { status: 500 },
    )
  }
}
