"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import { format, parseISO, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, RefreshCcw } from "lucide-react"
import { DateRangePicker } from "../../../components/date-range-picker"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface StatsViewProps {
  userId: string
}

export function StatsView({ userId }: StatsViewProps) {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Construire l'URL de l'API avec les filtres de date
  const getApiUrl = () => {
    const url = `/api/users/${userId}/stats`
    const params = new URLSearchParams()

    if (dateRange?.from) {
      params.append("startDate", format(dateRange.from, "yyyy-MM-dd"))
    }
    if (dateRange?.to) {
      params.append("endDate", format(dateRange.to, "yyyy-MM-dd"))
    }

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  // Récupérer les statistiques
  const { data: stats, error, isLoading, mutate } = useSWR(getApiUrl(), fetcher)

  // Effet pour rafraîchir les données lorsque la plage de dates change
  useEffect(() => {
    mutate()
  }, [dateRange, mutate])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Fonction pour formater la durée en minutes
  const formatDuration = (minutes: number) => {
    return `${Math.round(minutes)} min`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-amber-500" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des statistiques</div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Date range and refresh */}
      <div className="flex justify-between items-center">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isOpen={isFilterOpen}
          onOpenChange={setIsFilterOpen}
        />
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => mutate()} title="Rafraîchir">
          <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <RefreshCcw className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Sur la période sélectionnée</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats?.avgDuration || 0)}</div>
              <p className="text-xs text-muted-foreground">Par rendez-vous</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée Totale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats?.totalDuration || 0)}</div>
              <p className="text-xs text-muted-foreground">Temps de travail</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Service stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temps moyen par service</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.serviceStats && stats.serviceStats.length > 0 ? (
              <div className="space-y-4">
                {stats.serviceStats.map((serviceStat: any) => (
                  <div key={serviceStat.serviceId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 mr-2">
                          {serviceStat.count}
                        </Badge>
                        <span className="font-medium">{serviceStat.serviceName}</span>
                      </div>
                      <span className="text-sm font-bold">{formatDuration(serviceStat.avgDuration)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (serviceStat.avgDuration / 180) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible pour la période sélectionnée
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily stats chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rendez-vous par jour</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.dailyStats && stats.dailyStats.length > 0 ? (
              <div className="h-[200px] flex items-end justify-between">
                {stats.dailyStats.map((dayStat: any) => {
                  const height = `${Math.max(10, (dayStat.count / 10) * 100)}%`
                  return (
                    <div key={dayStat.date} className="flex flex-col items-center">
                      <div className="relative w-8 flex justify-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height }}
                          className="w-5 bg-amber-400 rounded-t-md"
                          title={`${dayStat.count} rendez-vous`}
                        />
                      </div>
                      <span className="text-xs mt-2 text-gray-500">
                        {format(parseISO(dayStat.date), "dd/MM", { locale: fr })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible pour la période sélectionnée
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

