"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fr } from "date-fns/locale"
import { format, addDays, isSameDay, startOfDay } from "date-fns"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarIcon, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { AppointmentDialog } from "../../components/appointment-dialog"
import { Input } from "@/components/ui/input"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CalendarPageClientProps {
  salonId: string
}

export function CalendarPageClient({ salonId }: CalendarPageClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(addDays(new Date(), 1)))
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [datesWithAppointments, setDatesWithAppointments] = useState<Date[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCalendarView, setIsCalendarView] = useState(true)

  // Formater la date pour l'API
  const formatDateForApi = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  // Récupérer les rendez-vous pour la date sélectionnée
  const {
    data: appointments,
    error,
    isLoading,
    mutate,
  } = useSWR(
    selectedDate ? `/api/organizations/${salonId}/appointments/date?date=${formatDateForApi(selectedDate)}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    },
  )

  // Récupérer tous les rendez-vous pour marquer les dates dans le calendrier
  const { data: allAppointments, mutate: mutateAll } = useSWR(
    `/api/organizations/${salonId}/appointments/all`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Rafraîchir toutes les minutes
    },
  )

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
    setIsDialogOpen(true)
  }

  // Rafraîchir les données après la fermeture du dialogue
  const handleDialogClose = () => {
    setIsDialogOpen(false)
    mutate()
    mutateAll()
  }

  const handleAppointmentSuccess = () => {
    mutate()
    mutateAll()
  }

  // Filtrer les rendez-vous en fonction de la recherche
  const filteredAppointments = appointments
    ? appointments.filter(
        (appointment: any) =>
          appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phoneNumber.includes(searchTerm) ||
          appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "border-yellow-200 hover:border-yellow-500 bg-yellow-50"
      case "CONFIRMED":
        return "border-amber-200 hover:border-amber-500"
      case "INCHAIR":
        return "border-green-200 hover:border-green-500 bg-green-50"
      case "COMPLETED":
        return "border-gray-200 hover:border-gray-500 bg-gray-50"
      default:
        return "border-red-200 hover:border-red-500 bg-red-50"
    }
  }

  // Fonction pour obtenir la couleur de l'icône
  const getIconColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-600"
      case "CONFIRMED":
        return "bg-amber-100 text-amber-600"
      case "INCHAIR":
        return "bg-green-100 text-green-600"
      case "COMPLETED":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-red-100 text-red-600"
    }
  }

  // Fonction pour obtenir la couleur du badge
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CONFIRMED":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "INCHAIR":
        return "bg-green-50 text-green-700 border-green-200"
      case "COMPLETED":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-red-50 text-red-700 border-red-200"
    }
  }

  // Fonction pour formater le statut
  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "CONFIRMED":
        return "Confirmé"
      case "INCHAIR":
        return "En service"
      case "COMPLETED":
        return "Terminé"
      default:
        return status
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

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Date navigation */}
          {!isCalendarView && (
            <div className="flex justify-between items-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-100 p-2 rounded-full"
                onClick={() => {
                  if (selectedDate) {
                    setSelectedDate(addDays(selectedDate, -1))
                  }
                }}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsCalendarView(true)}>
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </span>
              </Button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-100 p-2 rounded-full"
                onClick={() => {
                  if (selectedDate) {
                    setSelectedDate(addDays(selectedDate, 1))
                  }
                }}
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>
          )}

          {/* Search input */}
          {!isCalendarView && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un rendez-vous..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Calendar view */}
          {isCalendarView ? (
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
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
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Date sélectionnée</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-amber-100"></div>
                  <span>Dates avec rendez-vous</span>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => setIsCalendarView(false)}>
                  Voir les rendez-vous
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-amber-500" />
                  </motion.div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Une erreur est survenue lors du chargement des rendez-vous
                </div>
              ) : filteredAppointments.length > 0 ? (
                <AnimatePresence>
                  {filteredAppointments.map((appointment: any, index: number) => (
                    <motion.div
                      key={appointment.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, y: -20 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <Card className={`border ${getStatusColor(appointment.status)} transition-colors cursor-pointer`}>
                        <div className="p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${getIconColor(appointment.status)}`}
                              >
                                <Clock className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-bold text-sm">{appointment.firstName}</span>
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 text-xs ${getBadgeColor(appointment.status)}`}
                                  >
                                    {appointment.estimatedTime}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {appointment.services.map((appointmentService: any) => (
                                    <Badge
                                      key={appointmentService.id}
                                      variant="outline"
                                      className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                      {appointmentService.service.name}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{appointment.phoneNumber}</p>
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatStatus(appointment.status)}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </motion.div>
                  <p>Aucun rendez-vous pour cette date</p>
                  {searchTerm && (
                    <Button variant="link" className="mt-2 text-amber-500" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Appointment Details Dialog */}
      <AppointmentDialog
        appointment={selectedAppointment}
        isOpen={isDialogOpen}
        mode="edit"
        onClose={handleDialogClose}
        salonId={salonId}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  )
}
