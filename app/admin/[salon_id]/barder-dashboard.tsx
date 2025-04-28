"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Loader2, User, BriefcaseBusiness, ListOrdered, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { UserSheet } from "@/components/user-sheet"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BarberDashboardProps {
  salonId: string
}

export default function BarberDashboard({ salonId }: BarberDashboardProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [activeTab, setActiveTab] = useState("appointments")

  // Récupérer les rendez-vous du jour pour ce coiffeur dans ce salon
  const today = format(new Date(), "yyyy-MM-dd")
  const {
    data: appointments,
    error,
    isLoading,
  } = useSWR(
    userId ? `/api/organizations/${salonId}/appointments/barber?date=${today}&barberId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    },
  )

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
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CONFIRMED":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "INCHAIR":
        return "bg-green-50 text-green-700 border-green-200"
      case "COMPLETED":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-amber-500" />
          </motion.div>
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href="/">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Tableau de bord</h1>
            <p className="text-white/80 text-xs">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/${salonId}/users/${userId}`}>
            <motion.button whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white">
              <User className="h-5 w-5" />
            </motion.button>
          </Link>
          <Link href={`/admin/${salonId}/waiting`}>
            <motion.button whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white">
              <ListOrdered className="h-5 w-5" />
            </motion.button>
          </Link>
          <UserSheet salonId={salonId} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rendez-vous aujourd'hui</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Clients à servir</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prochain client</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {appointments && appointments.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">{appointments[0].estimatedTime}</div>
                      <p className="text-xs text-muted-foreground">{appointments[0].firstName}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">--:--</div>
                      <p className="text-xs text-muted-foreground">Aucun rendez-vous</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="appointments"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Rendez-vous
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
              >
                <BriefcaseBusiness className="h-4 w-4 mr-1" />
                Mes services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="mt-4 space-y-4">
              {/* Appointments list */}
              {appointments && appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment: any, index: number) => (
                    <motion.div key={appointment.id} variants={itemVariants} whileHover={{ y: -2 }}>
                      <Card className={`overflow-hidden border ${getStatusColor(appointment.status)}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <span className="font-bold text-sm">{appointment.firstName}</span>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 text-xs ${getStatusColor(appointment.status)}`}
                                >
                                  {getStatusLabel(appointment.status)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {Array.isArray(appointment.services)
                                  ? appointment.services.map((service: { name: any }) => service.name).join(", ")
                                  : appointment.service?.name || "Service non spécifié"}
                              </p>
                              <p className="text-xs text-muted-foreground">{appointment.phoneNumber}</p>
                              <div className="flex items-center mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="text-xs text-muted-foreground">{appointment.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </motion.div>
                  <p>Aucun rendez-vous pour aujourd'hui</p>
                  <Button
                    variant="link"
                    className="mt-2 text-amber-500"
                    onClick={() => (window.location.href = `/admin/${salonId}/calendar`)}
                  >
                    Voir le calendrier complet
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-4 space-y-4">
              {/* Services list */}
              {session?.user?.id && <ServicesTab userId={session.user.id} salonId={salonId} />}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

// Composant pour l'onglet des services
function ServicesTab({ userId, salonId }: { userId: string; salonId: string }) {
  const {
    data: userServices,
    error,
    isLoading,
  } = useSWR(`/api/organizations/${salonId}/users/${userId}/services`, fetcher)

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
    return <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des services</div>
  }

  return (
    <div className="space-y-3">
      {userServices?.services && userServices.services.length > 0 ? (
        userServices.services.map((service: any) => (
          <motion.div key={service.id} whileHover={{ y: -2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {service.durationMin}-{service.durationMax} min
                      </span>
                    </div>
                  </div>
                  <Badge>{service.price.toLocaleString()} FCFA</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <BriefcaseBusiness className="h-8 w-8 text-gray-400" />
          </motion.div>
          <p>Aucun service assigné</p>
          <p className="text-sm text-muted-foreground mt-2">
            Contactez un administrateur pour vous assigner des services
          </p>
        </div>
      )}
    </div>
  )
}
