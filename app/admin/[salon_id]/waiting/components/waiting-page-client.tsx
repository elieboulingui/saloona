"use client"

import { useTransition, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2, CheckCircle, Clock, AlertCircle, Search, Eye, Filter } from "lucide-react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import type { AppointmentStatus } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WaitingPageClientProps {
  salonId: string
}

export default function WaitingPage({ salonId }: WaitingPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterBarberId, setFilterBarberId] = useState<string | null>(null)
  const [filterServiceId, setFilterServiceId] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const today = format(new Date(), "yyyy-MM-dd")
  const {
    data: waitingClients = [],
    mutate,
    isLoading,
  } = useSWR(`/api/organizations/${salonId}/appointments/date?date=${today}`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

  // Récupérer la liste des coiffeurs
  const { data: barbers = [] } = useSWR(`/api/organizations/${salonId}/users?role=BARBER`, fetcher)

  // Récupérer la liste des services
  const { data: services = [] } = useSWR(`/api/organizations/${salonId}/services`, fetcher)

  const [isPending, startTransition] = useTransition()

  // Trier les rendez-vous par heure
  const sortedWaitingClients = [...waitingClients].sort((a, b) => {
    const timeA = a.hourAppointment || "00:00"
    const timeB = b.hourAppointment || "00:00"
    return timeA.localeCompare(timeB)
  })

  // Filtrer les clients en fonction de la recherche, du statut, du coiffeur et du service
  const filteredClients = sortedWaitingClients.filter((client: any) => {
    const matchesSearch =
      searchTerm === "" ||
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phoneNumber.includes(searchTerm)

    const matchesStatus = filterStatus === null || client.status === filterStatus

    const matchesBarber = filterBarberId === null || client.barberId === filterBarberId

    const matchesService =
      filterServiceId === null || client.services.some((service: any) => service.service.id === filterServiceId)

    return matchesSearch && matchesStatus && matchesBarber && matchesService && !client.removed
  })

  const getNextStatus = (currentStatus: AppointmentStatus) => {
    switch (currentStatus) {
      case "CONFIRMED":
        return "INCHAIR"
      case "INCHAIR":
        return "COMPLETED"
      default:
        return null
    }
  }

  const handleClientStatusChange = async (clientId: string, currentStatus: AppointmentStatus) => {
    const nextStatus = getNextStatus(currentStatus)
    if (!nextStatus) return

    startTransition(async () => {
      try {
        await fetch(`/api/organizations/${salonId}/appointments/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        })
        mutate()
      } catch (error) {
        console.error("Erreur lors du changement de statut:", error)
      }
    })
  }

  // Fonction pour démarrer un service spécifique
  const handleStartService = async (appointmentId: string, serviceId: string, barberId: string) => {
    
    startTransition(async () => {
      try {
        await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}/services/${serviceId}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberId,
            startDate: new Date().toISOString(),
          }),
        })
        mutate()
        // Rafraîchir les détails du rendez-vous sélectionné
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          const response = await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}`)
          const updatedAppointment = await response.json()
          setSelectedAppointment(updatedAppointment)
        }
      } catch (error) {
        console.error("Erreur lors du démarrage du service:", error)
      }
    })
  }

  // Fonction pour terminer un service spécifique
  const handleCompleteService = async (appointmentId: string, serviceId: string) => {
    startTransition(async () => {
      try {
        await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}/services/${serviceId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endDate: new Date().toISOString(),
          }),
        })
        mutate()
        // Rafraîchir les détails du rendez-vous sélectionné
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          const response = await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}`)
          const updatedAppointment = await response.json()
          setSelectedAppointment(updatedAppointment)
        }
      } catch (error) {
        console.error("Erreur lors de la finalisation du service:", error)
      }
    })
  }

  // Fonction pour ouvrir les détails d'un rendez-vous
  const handleOpenDetails = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}`)
      const appointment = await response.json()
      setSelectedAppointment(appointment)
      setIsDetailsOpen(true)
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du rendez-vous:", error)
    }
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd MMMM yyyy", { locale: fr })
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date invalide"
    }
  }

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

  // Fonction pour formater la durée
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0 min"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-amber-500" />
          </motion.div>
          <p className="mt-4 text-gray-500">Chargement des clients en attente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-white font-bold text-xl">File d'attente</h1>
          <p className="text-white/80 text-xs">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 p-2 rounded-full text-white"
            onClick={() => mutate()}
          >
            <Clock className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Search and filters */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Advanced filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Statut</h3>
                    <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="CONFIRMED">En attente</SelectItem>
                        <SelectItem value="INCHAIR">En service</SelectItem>
                        <SelectItem value="COMPLETED">Terminés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Coiffeur</h3>
                    <Select value={filterBarberId || ""} onValueChange={(value) => setFilterBarberId(value || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les coiffeurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les coiffeurs</SelectItem>
                        {barbers.map((barber: any) => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Service</h3>
                    <Select value={filterServiceId || ""} onValueChange={(value) => setFilterServiceId(value || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les services</SelectItem>
                        {services.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFilterStatus(null)
                      setFilterBarberId(null)
                      setFilterServiceId(null)
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick status filters */}
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                filterStatus === null ? "bg-amber-100 text-amber-800" : ""
              }`}
              onClick={() => setFilterStatus(null)}
            >
              Tous
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                filterStatus === "CONFIRMED" ? "bg-amber-100 text-amber-800" : ""
              }`}
              onClick={() => setFilterStatus("CONFIRMED")}
            >
              En attente
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                filterStatus === "INCHAIR" ? "bg-green-100 text-green-800" : ""
              }`}
              onClick={() => setFilterStatus("INCHAIR")}
            >
              En service
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                filterStatus === "COMPLETED" ? "bg-gray-100 text-gray-800" : ""
              }`}
              onClick={() => setFilterStatus("COMPLETED")}
            >
              Terminés
            </Badge>
          </div>

          {/* Client list */}
          {filteredClients.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredClients.map((waiting: any) => {
                  const nextStatus = getNextStatus(waiting.status)

                  const buttonText =
                    waiting.status === "CONFIRMED"
                      ? "En chaise"
                      : waiting.status === "INCHAIR"
                        ? "Terminer"
                        : "✅ Terminé"

                  const buttonColor =
                    waiting.status === "CONFIRMED"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : waiting.status === "INCHAIR"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"



                  return (
                    <motion.div key={waiting.id} variants={itemVariants} layout exit={{ opacity: 0, y: -20 }}>
                      <Card
                        className={`overflow-hidden border py-0 ${
                          waiting.status === "INCHAIR"
                            ? "border-green-500 bg-green-50"
                            : waiting.status === "COMPLETED"
                              ? "border-gray-300 bg-gray-100"
                              : "border-amber-200"
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              
                              <div>
                                <div className="flex items-center">
                                  <span className="text-sm">{waiting.firstName}</span>
                                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                                    {waiting.hourAppointment}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{waiting.phoneNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(waiting.date)} - {formatDuration(waiting.estimatedTime)}
                                </p>

                                {/* Services badges */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {waiting.services.map((service: any) => (
                                    <Badge
                                      key={service.id}
                                      variant="outline"
                                      className="bg-amber-50 text-amber-700 text-xs"
                                    >
                                      {service.service.name}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Barber info if assigned */}
                                {waiting.barberId && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-muted-foreground">Coiffeur:</span>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                                      {barbers.find((b: any) => b.id === waiting.barberId)?.name || "Assigné"}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleOpenDetails(waiting.id)}
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </Button>

                              {nextStatus && (
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    className={`${buttonColor} text-white`}
                                    onClick={() => handleClientStatusChange(waiting.id, waiting.status)}
                                    disabled={isPending}
                                  >
                                    {isPending ? "..." : buttonText}
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
              >
                <Users className="h-8 w-8 text-gray-400" />
              </motion.div>
              <p>Aucun client en attente</p>
              {(searchTerm || filterStatus || filterBarberId || filterServiceId) && (
                <Button
                  variant="link"
                  className="mt-2 text-amber-500"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus(null)
                    setFilterBarberId(null)
                    setFilterServiceId(null)
                  }}
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Appointment Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails du rendez-vous</SheetTitle>
            <SheetDescription>
              {selectedAppointment && `Client: ${selectedAppointment.firstName} - ${selectedAppointment.phoneNumber}`}
            </SheetDescription>
          </SheetHeader>

          {selectedAppointment && (
            <div className="py-6 px-4">
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Informations générales</h3>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Référence:</span>
                      <span className="text-sm font-medium">DIG-{selectedAppointment.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm">{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Heure:</span>
                      <span className="text-sm">{selectedAppointment.hourAppointment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge
                        className={
                          selectedAppointment.status === "CONFIRMED"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : selectedAppointment.status === "INCHAIR"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {selectedAppointment.status === "CONFIRMED"
                          ? "En attente"
                          : selectedAppointment.status === "INCHAIR"
                            ? "En service"
                            : "Terminé"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Durée estimée:</span>
                      <span className="text-sm">{formatDuration(selectedAppointment.estimatedTime)}</span>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-500">Notes:</span>
                        <p className="text-sm mt-1 bg-white p-2 rounded border">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Liste des services */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Services</h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {selectedAppointment.services.map((service: any) => {
                        const isStarted = !!service.startDate
                        const isCompleted = !!service.endDate
                        const assignedBarber = service.barberId
                          ? barbers.find((b: any) => b.id === service.barberId)
                          : null

                        return (
                          <Card
                            key={service.id}
                            className={`
                            ${
                              isCompleted
                                ? "border-green-500 bg-green-50"
                                : isStarted
                                  ? "border-amber-500 bg-amber-50"
                                  : "border-gray-200"
                            }
                          `}
                          >
                            <div className="p-3 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{service.service.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    {service.service.durationMin}-{service.service.durationMax} min •{" "}
                                    {service.service.price} FCFA
                                  </p>
                                </div>

                                {isCompleted ? (
                                  <Badge className="bg-green-100 text-green-800">Terminé</Badge>
                                ) : isStarted ? (
                                  <Badge className="bg-amber-100 text-amber-800">En cours</Badge>
                                ) : (
                                  <Badge variant="outline">En attente</Badge>
                                )}
                              </div>

                              {assignedBarber && (
                                <div className="flex items-center gap-2 bg-white p-2 rounded-md">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-purple-100 text-purple-800">
                                      {assignedBarber.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{assignedBarber.name}</span>
                                </div>
                              )}

                              {isStarted && (
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Début:</span>
                                    <span>{format(parseISO(service.startDate), "HH:mm", { locale: fr })}</span>
                                  </div>
                                  {isCompleted && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Fin:</span>
                                      <span>{format(parseISO(service.endDate), "HH:mm", { locale: fr })}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isCompleted && (
                                <div className="flex justify-end gap-2 mt-2">
                                  {!isStarted ? (
                                    <Select
                                      onValueChange={(barberId) => {
                                        handleStartService(selectedAppointment.id, service.id, barberId)
                                      }}
                                      disabled={isPending}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Débuter le service" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {barbers.map((barber: any) => (
                                          <SelectItem key={barber.id} value={barber.id}>
                                            {barber.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Button
                                      size="sm"
                                      disabled={isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleCompleteService(selectedAppointment.id, service.id)}
                                    >
                                      Terminer
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Actions */}
                <div className="pt-4">
                  <Button disabled={isPending} className="w-full" variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
