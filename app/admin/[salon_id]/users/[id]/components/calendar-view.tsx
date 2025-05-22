"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Clock, ChevronRight, CalendarIcon, RefreshCcw } from "lucide-react"

// Ajouter l'import pour AppointmentSheet
import { AppointmentSheet } from "@/app/admin/[salon_id]/components/appointment-sheet"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CalendarViewProps {
  userId: string
  salonId: string
}

export function CalendarView({ userId, salonId }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [isCalendarView, setIsCalendarView] = useState(false)

  // Dans la fonction CalendarView, ajouter ces états après les états existants
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isAppointmentSheetOpen, setIsAppointmentSheetOpen] = useState(false)

  // Formater la date pour l'API
  const formatDateForApi = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  // Récupérer les rendez-vous pour la date et l'utilisateur sélectionnés
  const {
    data: appointments = [],
    error,
    isLoading,
    mutate,
  } = useSWR(
    selectedDate && userId
      ? `/api/organizations/${salonId}/appointments/barber?date=${formatDateForApi(selectedDate)}&barberId=${userId}`
      : null,
    fetcher,
    {
      refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    },
  )

  // Récupérer tous les rendez-vous pour marquer les dates dans le calendrier
  const { data: allAppointments = [] } = useSWR(
    userId ? `/api/organizations/${salonId}/appointments/barber/all?barberId=${userId}` : null,
    fetcher,
  )

  // Filtrer les rendez-vous en fonction de la recherche
  const filteredAppointments = appointments.filter(
    (appointment: any) =>
      appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phoneNumber.includes(searchTerm) ||
      appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
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

  // Ajouter cette fonction avant le return
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsAppointmentSheetOpen(true)
  }

  const handleAppointmentUpdateSuccess = () => {
    setIsAppointmentSheetOpen(false)
    setSelectedAppointment(null)
    mutate() // Rafraîchir les données
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Date navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsCalendarView(true)}>
          <CalendarIcon className="h-4 w-4" />
          <span>{selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : "Sélectionner une date"}</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => mutate()} title="Rafraîchir">
          <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <RefreshCcw className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un rendez-vous..."
          className="pl-10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Calendar view */}
      {isCalendarView && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold mb-4">Sélectionner une date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setIsCalendarView(false)
              }}
              locale={fr}
              className="mx-auto"
              modifiers={{
                booked: allAppointments.map((app: any) => new Date(app.date)),
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
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsCalendarView(false)} className="mr-2">
                Annuler
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setIsCalendarView(false)}>
                Confirmer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Appointments list */}
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
        <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des rendez-vous</div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAppointments.map((appointment: any, index: number) => (
              <motion.div key={appointment.id} variants={itemVariants} layout whileHover={{ y: -2 }}>
                <Card
                  className={`overflow-hidden border py-0 ${getStatusColor(appointment.status)} cursor-pointer`}
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${getIconColor(
                            appointment.status,
                          )}`}
                        >
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-bold text-sm">{appointment.firstName}</span>
                            <Badge variant="outline" className={`ml-2 text-xs ${getStatusColor(appointment.status)}`}>
                              {appointment.hourAppointment}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {appointment.services &&
                              appointment.services.map((service: any) => (
                                <Badge
                                  key={service.serviceId}
                                  variant="outline"
                                  className="text-xs bg-amber-50 text-amber-700"
                                >
                                  {service.service.name}
                                </Badge>
                              ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{appointment.phoneNumber}</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {getStatusLabel(appointment.status)}
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
        </div>
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
      {selectedAppointment && (
        <AppointmentSheet
          isOpen={isAppointmentSheetOpen}
          onClose={() => setIsAppointmentSheetOpen(false)}
          appointment={selectedAppointment}
          mode="edit"
          salonId={salonId}
          onSuccess={handleAppointmentUpdateSuccess}
        />
      )}
    </motion.div>
  )
}
