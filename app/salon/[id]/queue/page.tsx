"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, Users, RefreshCw, AlertCircle, Calendar, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Types
interface QueueClient {
  id: string
  name: string
  service: string
  time: string
  orderNumber: number
  status: "waiting" | "inService" | "completed"
  estimatedDuration: number
  stylist?: string
}

// Données de démonstration
const MOCK_QUEUE_DATA: QueueClient[] = [
  {
    id: "q1",
    name: "Sophie Martin",
    service: "Démarrage Dreads",
    time: "09:00",
    orderNumber: 1,
    status: "inService",
    estimatedDuration: 120,
    stylist: "Marie Koné",
  },
  {
    id: "q2",
    name: "Thomas Dubois",
    service: "Réparation",
    time: "10:00",
    orderNumber: 2,
    status: "waiting",
    estimatedDuration: 45,
  },
  {
    id: "q3",
    name: "Emma Petit",
    service: "Entretien & Reprise",
    time: "11:00",
    orderNumber: 3,
    status: "waiting",
    estimatedDuration: 60,
  },
  {
    id: "q4",
    name: "Lucas Bernard",
    service: "Coloration Dreads",
    time: "13:30",
    orderNumber: 4,
    status: "waiting",
    estimatedDuration: 90,
  },
  {
    id: "q5",
    name: "Camille Leroy",
    service: "Démarrage Dreads",
    time: "08:30",
    orderNumber: 5,
    status: "completed",
    estimatedDuration: 120,
    stylist: "Jean Kouassi",
  },
  {
    id: "q6",
    name: "Antoine Moreau",
    service: "Coupe Entretien",
    time: "09:45",
    orderNumber: 6,
    status: "completed",
    estimatedDuration: 30,
    stylist: "Marie Koné",
  },
]

export default function SalonQueuePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [queueData, setQueueData] = useState<QueueClient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueueData(MOCK_QUEUE_DATA)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Rafraîchir les données toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      // Dans une application réelle, nous ferions un appel API ici
      // Pour la démo, nous allons juste mettre à jour la date de dernière mise à jour
      setLastUpdated(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filtrer les clients en fonction de la recherche
  const filteredClients = queueData.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.orderNumber.toString().includes(searchTerm),
  )

  // Trier les clients par statut et ordre de passage
  const sortedClients = [...filteredClients].sort((a, b) => {
    // D'abord par statut (inService, waiting, completed)
    const statusOrder = { inService: 0, waiting: 1, completed: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    // Ensuite par ordre de passage
    return a.orderNumber - b.orderNumber
  })

  // Grouper les clients par statut
  const clientsInService = sortedClients.filter((client) => client.status === "inService")
  const clientsWaiting = sortedClients.filter((client) => client.status === "waiting")
  const clientsCompleted = sortedClients.filter((client) => client.status === "completed")

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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
    
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href={`/salon`}>
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
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => {
                setQueueData(MOCK_QUEUE_DATA)
                setLastUpdated(new Date())
                setIsLoading(false)
              }, 500)
            }}
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
            {queueData.length} client{queueData.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun client trouvé</p>
            <p className="text-sm text-center mb-4">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Il n'y a aucun client dans la file d'attente pour le moment"}
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
                      <Card className="overflow-hidden border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.name}</h3>
                                  <Badge className="ml-2 bg-green-500">En service</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{client.service}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {client.time} • {client.estimatedDuration} min
                                  </span>
                                </div>
                                {client.stylist && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coiffeur: <span className="font-medium">{client.stylist}</span>
                                  </p>
                                )}
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
                      <Card className="overflow-hidden border-amber-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="bg-amber-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.name}</h3>
                                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                                    En attente
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{client.service}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {client.time} • {client.estimatedDuration} min
                                  </span>
                                </div>
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
                      <Card className="overflow-hidden border-gray-200 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold">{client.name}</h3>
                                  <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700">
                                    Terminé
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{client.service}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {client.time} • {client.estimatedDuration} min
                                  </span>
                                </div>
                                {client.stylist && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Coiffeur: <span className="font-medium">{client.stylist}</span>
                                  </p>
                                )}
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
    </div>
  )
}
