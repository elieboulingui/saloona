"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  BarChartIcon as ChartBar,
  Edit,
  Loader2,
  Mail,
  Phone,
  User,
  UserCog,
  BriefcaseBusiness,
} from "lucide-react"
import { CalendarView } from "./calendar-view"
import { StatsView } from "./stats-view"
import { useSession } from "next-auth/react"
import { UserDialog } from "../../components/user-dialog"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UserDetailsPageClientProps {
  userId: string
  salonId: string
}

export function UserDetailsPageClient({ userId, salonId }: UserDetailsPageClientProps) {


  console.log({userId, salonId})

  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Récupérer les détails de l'utilisateur
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? `/api/organizations/${salonId}/users/${userId}` : null, fetcher)

  // Récupérer les services de l'utilisateur
  const { data: userServices, mutate: mutateServices } = useSWR(
    userId ? `/api/organizations/${salonId}/users/${userId}/services` : null,
    fetcher,
  )

  // Vérifier si l'utilisateur connecté est un ADMIN ou s'il s'agit de son propre profil
  const canEdit = session?.user?.role === "ADMIN" || session?.user?.id === userId

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200"
      case "BARBER":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "CLIENT":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "BARBER":
        return "Coiffeur"
      case "CLIENT":
        return "Client"
      default:
        return role
    }
  }

  // Gérer l'édition de l'utilisateur
  const handleEditUser = () => {
    if (canEdit) {
      setIsDialogOpen(true)
    }
  }

  // Rafraîchir les services après la mise à jour de l'utilisateur
  const handleUserUpdateSuccess = () => {
    setIsDialogOpen(false)
    mutate()
    mutateServices()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <header className="bg-amber-500 p-4 flex items-center shadow-md">
          <Link href={`/admin/${salonId}/users`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full mr-3">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <h1 className="text-white font-bold text-xl">Détails de l'utilisateur</h1>
        </header>
        <div className="flex justify-center items-center h-full py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-amber-500" />
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col min-h-[100dvh]">
        <header className="bg-amber-500 p-4 flex items-center shadow-md">
          <Link href="/admin/users">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full mr-3">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <h1 className="text-white font-bold text-xl">Détails de l'utilisateur</h1>
        </header>
        <div className="flex justify-center items-center h-full py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement des données de l'utilisateur</p>
            <Button onClick={() => router.push("/admin/users")} className="bg-amber-500 hover:bg-amber-600">
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href={session?.user?.role === "ADMIN" ? "/admin/users" : "/admin"}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">{user.name || "Utilisateur"}</h1>
            <p className="text-white/80 text-xs">{user.email}</p>
          </div>
        </div>
        {canEdit && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 p-2 rounded-full text-white"
            onClick={handleEditUser}
          >
            <Edit className="h-5 w-5" />
          </motion.button>
        )}
      </header>

      <main className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="profile"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
            >
              <User className="h-4 w-4 mr-1" />
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
            >
              <ChartBar className="h-4 w-4 mr-1" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="overflow-hidden border shadow-sm py-0">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 p-6 flex flex-col items-center justify-center bg-gray-50">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                      {user.image ? (
                        <img
                          src={user.image || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCog className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-center">{user.name}</h2>
                    <Badge variant="outline" className={`mt-2 ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <div className="w-full md:w-2/3 p-6">
                    <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p>{user.phone}</p>
                          </div>
                        </div>
                      )}
                      {user.role === "BARBER" && (
                        <>
                          {user.speciality && (
                            <div className="flex items-start">
                              <BriefcaseBusiness className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Spécialité</p>
                                <p>{user.speciality}</p>
                              </div>
                            </div>
                          )}
                          <div className="pt-4">
                            <p className="text-sm text-gray-500 mb-2">Services proposés</p>
                            <div className="flex flex-wrap gap-2">
                              {userServices && userServices.services && userServices.services.length > 0 ? (
                                userServices.services.map((service: any) => (
                                  <Badge key={service.id} variant="outline" className="bg-amber-50 text-amber-700">
                                    {service.name}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">Aucun service assigné</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView userId={userId} salonId={salonId}/>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsView userId={userId} salonId={salonId}/>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Dialog */}
      {canEdit && (
        <UserDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          user={user}
          mode="edit"
          salonId={salonId}
          onSuccess={handleUserUpdateSuccess}
        />
      )}
    </div>
  )
}
