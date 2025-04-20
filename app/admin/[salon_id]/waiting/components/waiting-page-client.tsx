"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Search, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AppointmentDialog } from "../../components/appointment-dialog"
import { format, isToday, isPast, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WaitingPageClientProps {
  salonId: string
}

export function WaitingPageClient({ salonId }: WaitingPageClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("today")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Récupérer les rendez-vous du salon
  const {
    data: appointments,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/organizations/${salonId}/appointments`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  // Filtrer les rendez-vous en fonction de l'onglet actif et du terme de recherche
  const filteredAppointments = appointments
    ? appointments.filter((appointment: any) => {
        const appointmentDate = parseISO(appointment.date)
        const matchesTab =
          (activeTab === "today" && isToday(appointmentDate)) ||
          (activeTab === "upcoming" && !isToday(appointmentDate) && !isPast(appointmentDate)) ||
          activeTab === "all"

        const matchesSearch =
          searchTerm === "" ||
          appointment.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.barber?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.services?.some((service: any) => service.name?.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesTab && matchesSearch
      })
    : []

  // Trier les rendez-vous par date
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  })

  // Gérer l'ouverture du dialogue de rendez-vous
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  // Gérer la fermeture du dialogue de rendez-vous
  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedAppointment(null)
  }

  // Gérer le succès de la mise à jour du rendez-vous
  const handleAppointmentSuccess = () => {
    setIsDialogOpen(false)
    setSelectedAppointment(null)
    mutate()
  }

  // Gérer le changement de statut du rendez-vous
  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/organizations/${salonId}/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut")
      }

      mutate()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  // Obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200"
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "CONFIRMED":
        return "Confirmé"
      case "CANCELLED":
        return "Annulé"
      case "COMPLETED":
        return "Terminé"
      default:
        return status
    }
  }

  // Calculer le prix total des services
  const calculateTotalPrice = (services: any[]) => {
    return services.reduce((total, service) => total + service.price, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
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
      <div className="flex justify-center items-center h-full py-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement des rendez-vous</p>
          <Button onClick={() => router.refresh()} className="bg-amber-500 hover:bg-amber-600">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Liste d'attente</h1>
        <p className="text-gray-500">Gérez les rendez-vous et la liste d'attente du salon</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un client, coiffeur ou service..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="today"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            À venir
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            Tous
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment)}
                onStatusChange={handleStatusChange}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                calculateTotalPrice={calculateTotalPrice}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucun rendez-vous pour aujourd'hui</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment)}
                onStatusChange={handleStatusChange}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                calculateTotalPrice={calculateTotalPrice}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucun rendez-vous à venir</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment)}
                onStatusChange={handleStatusChange}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                calculateTotalPrice={calculateTotalPrice}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogue de rendez-vous */}
      {selectedAppointment && (
        <AppointmentDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          appointment={selectedAppointment}
          mode="edit"
          salonId={salonId}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  )
}

// Composant de carte de rendez-vous
interface AppointmentCardProps {
  appointment: any
  onClick: () => void
  onStatusChange: (appointmentId: string, status: string) => void
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
  calculateTotalPrice: (services: any[]) => number
}

function AppointmentCard({
  appointment,
  onClick,
  onStatusChange,
  getStatusColor,
  getStatusLabel,
  calculateTotalPrice,
}: AppointmentCardProps) {
  const appointmentDate = parseISO(appointment.date)
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr })
  const formattedTime = appointment.startDate
    ? format(parseISO(appointment.startDate.toString()), "HH:mm")
    : "Non défini"

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 bg-gray-50 p-4 flex flex-col justify-center items-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">{formattedDate}</p>
              <p className="text-xl font-bold">{formattedTime}</p>
              <Badge className="mt-2">{`N° ${appointment.orderNumber}`}</Badge>
            </div>
          </div>
          <div className="w-full md:w-3/4 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold">{appointment.firstName || "Client inconnu"}</h3>
                <p className="text-sm text-gray-500">{appointment.phoneNumber || "Téléphone non renseigné"}</p>
              </div>
              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <User className="h-4 w-4 mr-1" />
              <span>{appointment.barber?.name || "Coiffeur non assigné"}</span>
            </div>

            {/* Liste des services */}
            <div className="mt-2 mb-3">
              <p className="text-xs text-gray-500 mb-1">Services:</p>
              <div className="flex flex-wrap gap-1">
                {appointment.services && appointment.services.length > 0 ? (
                  appointment.services.map((service: any) => (
                    <Badge key={service.id} variant="outline" className="bg-amber-50 text-amber-700">
                      {service.name} - {service.price} €
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Aucun service sélectionné</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-xs text-gray-500">Prix total</p>
                  <p className="font-medium">
                    {appointment.services && appointment.services.length > 0
                      ? `${calculateTotalPrice(appointment.services)} €`
                      : "0 €"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {appointment.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange(appointment.id, "CONFIRMED")
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange(appointment.id, "CANCELLED")
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  </>
                )}
                {appointment.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusChange(appointment.id, "COMPLETED")
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Terminer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
