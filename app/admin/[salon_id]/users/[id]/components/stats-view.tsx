"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import { format, parseISO, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, RefreshCcw, BarChart3, Users, Timer } from "lucide-react"
import { DateRangePicker } from "../../../components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface StatsViewProps {
  userId: string
  salonId: string
}

export function StatsView({ userId, salonId }: StatsViewProps) {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Construire l'URL de l'API avec les filtres de date
  const getApiUrl = () => {
    const url = `/api/organizations/${salonId}/users/${userId}/stats`
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

  // Fonction pour formater la durée en heures et minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return "0 min"

    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins} min`
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
      <div className="text-center py-8 text-red-500">
        <p className="mb-4">Une erreur est survenue lors du chargement des statistiques</p>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  // Calculer la période en jours
  const periodDays =
    dateRange.from && dateRange.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 30

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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            <Clock className="h-4 w-4 mr-1" />
            Services
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Journalier
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rendez-vous</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {periodDays > 1
                      ? `${Math.round(((stats?.totalAppointments || 0) / periodDays) * 7)} par semaine`
                      : "Aujourd'hui"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
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
                  <p className="text-xs text-muted-foreground">
                    {periodDays > 1
                      ? `${formatDuration((stats?.totalDuration || 0) / periodDays)} par jour`
                      : "Aujourd'hui"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Service stats summary */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services les plus réalisés</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.serviceStats && stats.serviceStats.length > 0 ? (
                  <div className="space-y-4">
                    {stats.serviceStats.slice(0, 5).map((serviceStat: any) => (
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
                              width: `${Math.min(100, (serviceStat.count / (stats.totalAppointments || 1)) * 100)}%`,
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
        </TabsContent>

        {/* Services détaillés */}
        <TabsContent value="services" className="space-y-4">
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-bold">{formatDuration(serviceStat.avgDuration)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Durée totale: {formatDuration(serviceStat.totalDuration)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
        </TabsContent>

        {/* Statistiques journalières */}
        <TabsContent value="daily" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rendez-vous par jour</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                  <div className="h-[300px] flex items-end justify-between overflow-x-auto pb-4 px-2">
                    {stats.dailyStats.map((dayStat: any) => {
                      const maxCount = Math.max(...stats.dailyStats.map((d: any) => d.count))
                      const height = `${Math.max(10, (dayStat.count / (maxCount || 1)) * 100)}%`
                      return (
                        <TooltipProvider key={dayStat.date}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center mx-1">
                                <div className="relative h-[250px] w-10 flex justify-center items-end">
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height }}
                                    className="w-6 bg-amber-400 rounded-t-md"
                                  />
                                </div>
                                <span className="text-xs mt-2 text-gray-500">
                                  {format(parseISO(dayStat.date), "dd/MM", { locale: fr })}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {dayStat.count} rendez-vous le{" "}
                                {format(parseISO(dayStat.date), "dd MMMM", { locale: fr })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
