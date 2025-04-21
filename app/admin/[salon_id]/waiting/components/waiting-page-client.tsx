"use client"

import { useTransition, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2, CheckCircle, Clock, AlertCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { AppointmentStatus } from "@prisma/client"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface WaitingPageClientProps {
  salonId: string
}

export default function WaitingPage({salonId}: WaitingPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const today = format(new Date(), "yyyy-MM-dd")
  const {
    data: waitingClients = [],
    mutate,
    isLoading,
  } = useSWR(`/api/organizations/${salonId}/appointments/date?date=${today}`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

  const [isPending, startTransition] = useTransition()

  // Filtrer les clients en fonction de la recherche et du statut
  const filteredClients = waitingClients.filter((client: any) => {
    const matchesSearch =
      searchTerm === "" ||
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phoneNumber.includes(searchTerm) ||
      client.service?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === null || client.status === filterStatus

    return matchesSearch && matchesStatus && !client.removed
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
        await fetch(`/api/appointments/${clientId}`, {
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

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                {filteredClients.map((client: any, index: number) => {
                  const nextStatus = getNextStatus(client.status)
                  const buttonText =
                    client.status === "CONFIRMED"
                      ? "En chaise"
                      : client.status === "INCHAIR"
                        ? "Terminer"
                        : "✅ Terminé"

                  const buttonColor =
                    client.status === "CONFIRMED"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : client.status === "INCHAIR"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"

                  const statusIcon =
                    client.status === "CONFIRMED" ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : client.status === "INCHAIR" ? (
                      <AlertCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                    )

                  return (
                    <motion.div key={client.id} variants={itemVariants} layout exit={{ opacity: 0, y: -20 }}>
                      <Card
                        className={`overflow-hidden border py-0 ${
                          client.status === "INCHAIR"
                            ? "border-green-500 bg-green-50"
                            : client.status === "COMPLETED"
                              ? "border-gray-300 bg-gray-100"
                              : "border-amber-200"
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  client.status === "INCHAIR"
                                    ? "bg-green-100"
                                    : client.status === "COMPLETED"
                                      ? "bg-gray-100"
                                      : "bg-amber-100"
                                }`}
                              >
                                {statusIcon}
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-bold text-sm mr-2">DIG-{client.orderNumber}</span>
                                  <span className="text-sm">{client.firstName}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{client.phoneNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(client.date)} - {client.estimatedTime}
                                </p>
                                <p className="text-xs text-muted-foreground">Service: {client.service.name}</p>
                              </div>
                            </div>

                            {nextStatus ? (
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  className={`${buttonColor} text-white`}
                                  onClick={() => handleClientStatusChange(client.id, client.status)}
                                  disabled={isPending}
                                >
                                  {isPending ? "Mise à jour..." : buttonText}
                                </Button>
                              </motion.div>
                            ) : (
                              <span className="text-sm text-gray-500">Terminé</span>
                            )}
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
              {searchTerm && (
                <Button variant="link" className="mt-2 text-amber-500" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

