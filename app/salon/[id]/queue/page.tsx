"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, Users, RefreshCw, AlertCircle, User, Search, Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import useSWR from "swr"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SalonQueuePage() {
  const router = useRouter()
  const { id } = useParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Formater la date actuelle pour l'API
  const today = format(new Date(), "yyyy-MM-dd")

  // Récupérer les rendez-vous du jour avec SWR
  const {
    data: appointments,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/organizations/${id}/appointments/date?date=${today}`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  // Rafraîchir les données manuellement
  const refreshData = () => {
    setLastUpdated(new Date())
    mutate()
  }

  // Filtrer les rendez-vous en fonction de la recherche
  const filteredAppointments = appointments
    ? appointments.filter(
        (appointment: any) =>
          appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phoneNumber.includes(searchTerm) ||
          appointment.services.some((service: any) =>
            service.service.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : []

  // Trier les rendez-vous par statut et heure estimée
  const sortedAppointments = [...(filteredAppointments || [])].sort((a, b) => {
    // D'abord par statut (INCHAIR, CONFIRMED, PENDING, COMPLETED)
    const statusOrder: Record<"INCHAIR" | "CONFIRMED" | "PENDING" | "COMPLETED", number> = {
      INCHAIR: 0,
      CONFIRMED: 1,
      PENDING: 2,
      COMPLETED: 3,
    }
    if (statusOrder[a.status as keyof typeof statusOrder] !== statusOrder[b.status as keyof typeof statusOrder]) {
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
    }
    // Ensuite par heure estimée
    return a.estimatedTime.localeCompare(b.estimatedTime)
  })

  // Grouper les rendez-vous par statut
  const clientsInService = sortedAppointments.filter((client) => client.status === "INCHAIR")
  const clientsWaiting = sortedAppointments.filter(
    (client) => client.status === "PENDING" || client.status === "CONFIRMED",
  )
  const clientsCompleted = sortedAppointments.filter((client) => client.status === "COMPLETED")

  // Vérifier s'il y a des clients actifs (en service ou en attente)
  const hasActiveClients = clientsInService.length > 0 || clientsWaiting.length > 0

  // Formater l'heure de dernière mise à jour
  const formatLastUpdated = () => {
    return format(lastUpdated, "HH:mm:ss", { locale: fr })
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

  // Fonction pour obtenir les services d'un rendez-vous
  const getServiceNames = (appointment: any) => {
    if (!appointment.services || appointment.services.length === 0) {
      return "Aucun service"
    }
    return appointment.services.map((service: any) => service.service.name).join(", ")
  }

  // Fonction pour naviguer vers la page de réservation
  const goToBooking = () => {
    router.push(`/salon/${id}/booking`)
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href={`/salon/${id}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">File d'attente</h1>
            <p className="text-white/80 text-xs">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 p-2 rounded-full text-white"
            onClick={refreshData}
          >
            <RefreshCw className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-auto">
        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dernière mise à jour */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Dernière mise à jour: <span className="font-medium">{formatLastUpdated()}</span>
          </p>
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            {appointments ? appointments.length : 0} client{(appointments?.length || 0) !== 1 ? "s" : ""}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle className="h-16 w-16 mb-4 text-red-300" />
            <p className="text-lg font-medium mb-2">Erreur de chargement</p>
            <p className="text-sm text-center mb-4">Une erreur est survenue lors du chargement des rendez-vous</p>
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun client trouvé</p>
            <p className="text-sm text-center mb-4">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Il n'y a aucun client dans la file d'attente pour aujourd'hui"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Réinitialiser la recherche
              </Button>
            )}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Clients en service */}
            {clientsInService.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-lg font-bold flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  En service
                </h2>
                <AnimatePresence>
                  {clientsInService.map((client) => (
                    <motion.div
                      key={client.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, y: -20 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={`overflow-hidden ${getStatusColor(client.status)}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div
                                className={`rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ${getIconColor(client.status)}`}
                              >
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.firstName}</h3>
                                  <Badge className={`ml-2 ${getBadgeColor(client.status)}`}>
                                    {client.estimatedTime}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{getServiceNames(client)}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{client.estimatedTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{client.phoneNumber}</p>
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatStatus(client.status)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                              <span className="font-bold text-green-600">{client.orderNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Clients en attente */}
            {clientsWaiting.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-lg font-bold flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  En attente
                </h2>
                <AnimatePresence>
                  {clientsWaiting.map((client) => (
                    <motion.div
                      key={client.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, y: -20 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={`overflow-hidden ${getStatusColor(client.status)}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div
                                className={`rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ${getIconColor(client.status)}`}
                              >
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.firstName}</h3>
                                  <Badge variant="outline" className={`ml-2 ${getBadgeColor(client.status)}`}>
                                    {client.estimatedTime}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{getServiceNames(client)}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{client.estimatedTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{client.phoneNumber}</p>
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatStatus(client.status)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                              <span className="font-bold text-amber-600">{client.orderNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Clients terminés */}
            {clientsCompleted.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-lg font-bold flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />
                  Terminés
                </h2>
                <AnimatePresence>
                  {clientsCompleted.map((client) => (
                    <motion.div
                      key={client.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, y: -20 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={`overflow-hidden ${getStatusColor(client.status)}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div
                                className={`rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ${getIconColor(client.status)}`}
                              >
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.firstName}</h3>
                                  <Badge variant="outline" className={`ml-2 ${getBadgeColor(client.status)}`}>
                                    {client.estimatedTime}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{getServiceNames(client)}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{client.estimatedTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{client.phoneNumber}</p>
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatStatus(client.status)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                              <span className="font-bold text-gray-600">{client.orderNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Bouton flottant pour faire une réservation quand il n'y a pas de clients actifs */}
      {!isLoading && !error && !hasActiveClients && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            onClick={goToBooking}
            className="bg-amber-500 hover:bg-amber-600 rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
          >
            <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
              <Calendar className="h-6 w-6" />
            </motion.div>
          </Button>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Faire une réservation
          </span>
        </motion.div>
      )}
    </div>
  )
}
