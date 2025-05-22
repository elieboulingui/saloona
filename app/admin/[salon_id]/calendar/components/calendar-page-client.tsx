"use client"

import { useState, useEffect, useMemo } from "react"
import { fr } from "date-fns/locale"
import { format, addDays, isSameDay, startOfDay, isToday } from "date-fns"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, ChevronLeft, ChevronRight, Search, Plus, Users, ArrowLeft } from "lucide-react"
import { AppointmentSheet } from "../../components/appointment-sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { motion } from "framer-motion"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CalendarPageClientProps {
  salonId: string
}

interface Barber {
  id: string
  name: string
  image?: string
}

interface Appointment {
  id: string
  firstName: string
  date: string
  hourAppointment: string
  startDate?: string | null
  endDate?: string | null
  estimatedTime: number
  status: string
  barberId: string | null
  services: {
    id: string
    service: {
      id: string
      name: string
      price: number
      durationMin: number
    }
  }[]
}

// Function to get color based on service type or status
const getAppointmentColor = (appointment: Appointment) => {
  // D'abord, vérifier le statut
  switch (appointment.status) {
    case "PENDING":
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
    case "CONFIRMED":
      return "bg-blue-100 border-blue-300 hover:bg-blue-200"
    case "INCHAIR":
      return "bg-green-100 border-green-300 hover:bg-green-200"
    case "COMPLETED":
      return "bg-gray-100 border-gray-300 hover:bg-gray-200"
    default:
      // Si le statut n'est pas reconnu, utiliser le type de service
      const serviceName = appointment.services[0]?.service.name || ""

      if (serviceName.toLowerCase().includes("massage")) {
        return "bg-emerald-100 border-emerald-300 hover:bg-emerald-200"
      } else if (serviceName.toLowerCase().includes("coupe") || serviceName.toLowerCase().includes("cut")) {
        return "bg-blue-100 border-blue-300 hover:bg-blue-200"
      } else if (serviceName.toLowerCase().includes("color") || serviceName.toLowerCase().includes("couleur")) {
        return "bg-amber-100 border-amber-300 hover:bg-amber-200"
      } else if (serviceName.toLowerCase().includes("barbe") || serviceName.toLowerCase().includes("beard")) {
        return "bg-pink-100 border-pink-300 hover:bg-pink-200"
      } else {
        return "bg-purple-100 border-purple-300 hover:bg-purple-200"
      }
  }
}

// Fonction pour formater l'heure (ex: "09:30")
const formatTime = (time: string) => {
  return time
}

export function CalendarPageClient({ salonId }: CalendarPageClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [datesWithAppointments, setDatesWithAppointments] = useState<Date[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"calendar" | "day" | "week">("day")
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [startHour, setStartHour] = useState(8) // Heure de début (8h)
  const [endHour, setEndHour] = useState(20) // Heure de fin (20h)

  // Formater la date pour l'API
  const formatDateForApi = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  // Récupérer les rendez-vous pour la date sélectionnée
  const {
    data: appointments,
    error: appointmentsError,
    isLoading: isLoadingAppointments,
    mutate: mutateAppointments,
  } = useSWR<Appointment[]>(
    `/api/organizations/${salonId}/appointments/date?date=${formatDateForApi(selectedDate)}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    },
  )

  // Récupérer les coiffeurs du salon
  const {
    data: barbers,
    error: barbersError,
    isLoading: isLoadingBarbers,
  } = useSWR<Barber[]>(`/api/organizations/${salonId}/users`, fetcher)

  // Récupérer tous les rendez-vous pour marquer les dates dans le calendrier
  const { data: allAppointments, mutate: mutateAll } = useSWR(
    `/api/organizations/${salonId}/appointments/all`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Rafraîchir toutes les minutes
    },
  )

  // Récupérer les informations de disponibilité de l'organisation
  const { data: availability } = useSWR(`/api/organizations/${salonId}/availability`, fetcher)

  // Mettre à jour les heures d'ouverture et de fermeture en fonction des données de disponibilité
  useEffect(() => {
    if (availability) {
      const openingHour = Math.floor(availability.openingTime / 60)
      const closingHour = Math.ceil(availability.closingTime / 60)

      setStartHour(openingHour)
      setEndHour(closingHour)
    }
  }, [availability])

  // Mettre à jour les dates avec rendez-vous lorsque allAppointments change
  useEffect(() => {
    if (allAppointments && Array.isArray(allAppointments)) {
      const dates = allAppointments.map((appointment: any) => {
        return startOfDay(new Date(appointment.date))
      })

      // Éliminer les doublons en comparant les dates avec isSameDay
      const uniqueDates: Date[] = []
      dates.forEach((date) => {
        if (!uniqueDates.some((uniqueDate) => isSameDay(uniqueDate, date))) {
          uniqueDates.push(date)
        }
      })

      setDatesWithAppointments(uniqueDates)
    }
  }, [allAppointments])

  // Gérer le clic sur un rendez-vous
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsCreateMode(false)
    setIsDialogOpen(true)
  }

  // Rafraîchir les données après la fermeture du dialogue
  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleAppointmentSuccess = () => {
    mutateAppointments()
    mutateAll()
  }

  // Filtrer les rendez-vous en fonction de la recherche
  const filteredAppointments = useMemo(() => {
    if (!appointments) return []

    return appointments.filter(
      (appointment: any) =>
        appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.phoneNumber?.includes(searchTerm) ||
        appointment.services.some((service: any) =>
          service.service.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }, [appointments, searchTerm])

  // Organiser les rendez-vous par coiffeur
  const appointmentsByBarber = useMemo(() => {
    if (!barbers || !filteredAppointments) return {}

    return barbers.reduce((acc: Record<string, Appointment[]>, barber) => {
      acc[barber.id] = filteredAppointments.filter((appointment) => appointment.barberId === barber.id)
      return acc
    }, {})
  }, [barbers, filteredAppointments])

  // Rendez-vous non assignés
  const unassignedAppointments = useMemo(() => {
    return filteredAppointments.filter((appointment) => !appointment.barberId)
  }, [filteredAppointments])

  // Gérer le drag and drop
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    // Si pas de destination ou même source et destination, ne rien faire
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Trouver le rendez-vous déplacé
    const appointment = filteredAppointments.find((app) => app.id === draggableId)
    if (!appointment) return

    // Mettre à jour le barberId
    const newBarberId = destination.droppableId === "unassigned" ? null : destination.droppableId

    // Mise à jour optimiste: créer une copie des rendez-vous actuels
    const updatedAppointment = { ...appointment, barberId: newBarberId }

    // Créer une copie des rendez-vous avec la mise à jour
    const optimisticAppointments = filteredAppointments.map((app) =>
      app.id === draggableId ? updatedAppointment : app,
    )

    // Mettre à jour l'état local immédiatement avec les données optimistes
    mutateAppointments(optimisticAppointments, false)

    try {
      // Appel API pour mettre à jour le rendez-vous
      const response = await fetch(`/api/organizations/${salonId}/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: newBarberId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      // Si la requête réussit, revalider les données
      mutateAppointments()
    } catch (error) {
      console.error("Error updating appointment:", error)

      // En cas d'erreur, revenir à l'état précédent
      mutateAppointments()
    }
  }

  // Créer un nouveau rendez-vous
  const handleCreateAppointment = () => {
    setSelectedAppointment(null)
    setIsCreateMode(true)
    setIsDialogOpen(true)
  }

  // Générer les heures pour l'affichage du calendrier
  const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour)

  // Fonction pour calculer la position et la hauteur d'un rendez-vous
  const calculateAppointmentPosition = (appointment: Appointment) => {
    // Extraire l'heure et les minutes du rendez-vous
    const [hours, minutes] = appointment.hourAppointment.split(":").map(Number)

    // Calculer la position en minutes depuis le début de la journée
    const startMinutes = (hours - startHour) * 60 + minutes

    // Calculer la hauteur en fonction de la durée estimée
    const height = appointment.estimatedTime || 30 // Valeur par défaut de 30 minutes

    return {
      top: startMinutes,
      height: height,
    }
  }

  // Fonction pour vérifier si deux rendez-vous se chevauchent
  const doAppointmentsOverlap = (app1: Appointment, app2: Appointment) => {
    const [hours1, minutes1] = app1.hourAppointment.split(":").map(Number)
    const [hours2, minutes2] = app2.hourAppointment.split(":").map(Number)

    const start1 = hours1 * 60 + minutes1
    const start2 = hours2 * 60 + minutes2

    const end1 = start1 + (app1.estimatedTime || 30)
    const end2 = start2 + (app2.estimatedTime || 30)

    return start1 < end2 && start2 < end1
  }

  // Fonction pour calculer la position horizontale des rendez-vous qui se chevauchent
  const calculateHorizontalPosition = (
    appointment: Appointment,
    allAppointments: Appointment[],
    barberId: string | null,
  ) => {
    // Filtrer les rendez-vous du même coiffeur
    const barberAppointments = allAppointments.filter((app) => app.barberId === barberId)

    // Trouver les rendez-vous qui se chevauchent avec celui-ci
    const overlappingAppointments = barberAppointments.filter(
      (app) => app.id !== appointment.id && doAppointmentsOverlap(app, appointment),
    )

    if (overlappingAppointments.length === 0) {
      // Pas de chevauchement, utiliser toute la largeur
      return { width: 95, left: 2.5 }
    }

    // Déterminer la position de ce rendez-vous parmi ceux qui se chevauchent
    const sortedAppointments = [appointment, ...overlappingAppointments].sort((a, b) => {
      const [hoursA, minutesA] = a.hourAppointment.split(":").map(Number)
      const [hoursB, minutesB] = b.hourAppointment.split(":").map(Number)
      return hoursA * 60 + minutesA - (hoursB * 60 + minutesB)
    })

    const index = sortedAppointments.findIndex((app) => app.id === appointment.id)
    const totalOverlapping = overlappingAppointments.length + 1

    // Calculer la largeur et la position
    const width = 95 / totalOverlapping
    const left = 2.5 + index * width

    return { width, left }
  }

  // Vérifier s'il y a des erreurs
  const error = appointmentsError || barbersError
  const isLoading = isLoadingAppointments || isLoadingBarbers

  return (
    <div className="flex flex-col min-h-[90dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href={`/admin/${salonId}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
          <h1 className="text-white font-bold text-xl">Calendrier</h1>
          <p className="text-white/80 text-xs">{format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
        </div>
        </div>
       
        <div className="flex gap-2">
          <Button onClick={handleCreateAppointment} variant="outline" size="icon" className="rounded-full">
            <Plus className="h-5 w-5 text-black" />
          </Button>
        </div>
      </header>

      {/* Barre de navigation et recherche */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between bg-white">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            className={isToday(selectedDate) ? "bg-amber-100 border-amber-300" : ""}
          >
            Aujourd'hui
          </Button>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setViewMode("calendar")} className="bg-gray-100 text-black-500">
                    <span className="font-medium">{format(selectedDate, "EEEE d MMMM", { locale: fr })}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cliquez pour ouvrir le calendrier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={viewMode} onValueChange={(value: "calendar" | "day" | "week") => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="calendar">Calendrier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <main className="flex-1 p-0 overflow-auto">
        {viewMode === "calendar" ? (
          <div className="p-4 bg-white rounded-lg m-4 shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
              className="mx-auto"
              modifiers={{
                booked: datesWithAppointments,
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  borderRadius: "0",
                  fontWeight: "bold",
                  color: "#d97706",
                },
              }}
              classNames={{
                day_selected: "bg-amber-500 text-white hover:bg-amber-600",
                day_today: "bg-amber-100 text-amber-900",
              }}
            />
            <div className="mt-4 text-center">
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setViewMode("day")}>
                Voir les rendez-vous
              </Button>
            </div>
          </div>
        ) : viewMode === "day" ? (
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
                <Button variant="outline" className="mt-4" onClick={() => mutateAppointments()}>
                  Réessayer
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex h-[calc(100vh-180px)] overflow-auto">
                  {/* Colonne des heures */}
                  <div className="w-16 flex-shrink-0 border-r sticky left-0 z-50 bg-gray-50">
                    <div className="sticky top-0 h-16 bg-gray-50 border-b z-10"></div>
                    {hours.map((hour) => (
                      <div key={hour} className="h-[60px] border-b relative">
                        <span className="absolute top-[-10px] left-2 text-xs text-gray-500 mt-2">{hour}:00</span>
                      </div>
                    ))}
                  </div>

                  {/* Colonne des rendez-vous non assignés */}
                  <div className="flex-1 min-w-[200px] border-r relative">
                    <div className="sticky top-0 h-16 bg-white border-b z-40 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-200 p-2 rounded-full">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium mt-1">Non assigné</span>
                      </div>
                    </div>

                    <Droppable droppableId="unassigned">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="relative h-full min-h-[800px]"
                        >
                          {/* Lignes horizontales pour les heures */}
                          {hours.map((hour) => (
                            <div
                              key={hour}
                              className="absolute w-full h-[60px] border-b border-gray-200"
                              style={{ top: `${(hour - startHour) * 60}px` }}
                            >
                              {/* Lignes pour les créneaux de 15 minutes */}
                              <div className="absolute w-full h-[15px] border-b border-gray-100"></div>
                              <div className="absolute w-full h-[30px] border-b border-gray-100"></div>
                              <div className="absolute w-full h-[45px] border-b border-gray-100"></div>
                            </div>
                          ))}

                          {unassignedAppointments.map((appointment, index) => {
                            const { top, height } = calculateAppointmentPosition(appointment)
                            const { width, left } = calculateHorizontalPosition(
                              appointment,
                              unassignedAppointments,
                              null,
                            )
                            const colorClass = getAppointmentColor(appointment)

                            return (
                              <Draggable key={appointment.id} draggableId={appointment.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`absolute p-2 rounded-md border ${colorClass} shadow-sm cursor-pointer transition-all`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      top: `${top}px`,
                                      height: `${height}px`,
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      minHeight: "40px",
                                      zIndex: 10,
                                    }}
                                    onClick={() => handleAppointmentClick(appointment)}
                                  >
                                    <div className="text-sm font-medium truncate">{appointment.firstName}</div>
                                    <div className="text-xs truncate">
                                      {appointment.services.map((s) => s.service.name).join(", ")}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">{appointment.hourAppointment}</div>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Colonnes des coiffeurs */}
                  {barbers?.map((barber) => (
                    <div key={barber.id} className="flex-1 min-w-[200px] border-r relative">
                      <div className="sticky z-40 top-0 h-16 bg-white border-b flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={barber.image || "/placeholder.svg"} alt={barber.name} />
                            <AvatarFallback className="bg-amber-100 text-amber-800">
                              {barber.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium mt-1">{barber.name}</span>
                        </div>
                      </div>

                      <Droppable droppableId={barber.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="relative h-full min-h-[800px]"
                          >
                            {/* Lignes horizontales pour les heures */}
                            {hours.map((hour) => (
                              <div
                                key={hour}
                                className="absolute w-full h-[60px] border-b border-gray-200"
                                style={{ top: `${(hour - startHour) * 60}px` }}
                              >
                                {/* Lignes pour les créneaux de 15 minutes */}
                                <div className="absolute w-full h-[15px] border-b border-gray-100"></div>
                                <div className="absolute w-full h-[30px] border-b border-gray-100"></div>
                                <div className="absolute w-full h-[45px] border-b border-gray-100"></div>
                              </div>
                            ))}

                            {appointmentsByBarber[barber.id]?.map((appointment, index) => {
                              const { top, height } = calculateAppointmentPosition(appointment)
                              const { width, left } = calculateHorizontalPosition(
                                appointment,
                                appointmentsByBarber[barber.id] || [],
                                barber.id,
                              )
                              const colorClass = getAppointmentColor(appointment)

                              return (
                                <Draggable key={appointment.id} draggableId={appointment.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`absolute p-2 rounded-md border ${colorClass} shadow-sm cursor-pointer transition-all`}
                                      style={{
                                        ...provided.draggableProps.style,
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        minHeight: "40px",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleAppointmentClick(appointment)}
                                    >
                                      <div className="text-sm font-medium truncate">{appointment.firstName}</div>
                                      <div className="text-xs truncate">
                                        {appointment.services.map((s) => s.service.name).join(", ")}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">{appointment.hourAppointment}</div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            )}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-center text-gray-500">Vue semaine non implémentée</p>
          </div>
        )}
      </main>

      {/* Appointment Sheet */}
      <AppointmentSheet
        appointment={selectedAppointment}
        isOpen={isDialogOpen}
        mode={isCreateMode ? "create" : "edit"}
        onClose={handleDialogClose}
        salonId={salonId}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  )
}
