"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Clock,
  Edit,
  Scissors,
  Trash2,
  User,
  Users,
  Calendar,
  BarChart,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { ServiceDialog } from "../../components/service-dialog"
import { convertMinutes } from "@/lib/utils"
import { AlertModal } from "../../components/alert-modal"
import { format, isPast, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserDialog } from "../../../users/components/user-dialog"

interface ServiceDetailsClientProps {
  dashboardData: any
  departments: any[]
  salonId: string
}

export function ServiceDetailsClient({ dashboardData, departments, salonId }: ServiceDetailsClientProps) {
  const router = useRouter()
  const { service, appointments } = dashboardData
  const [currentService, setCurrentService] = useState(service)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)

  // Gérer l'ouverture du dialogue pour modifier le service
  const handleEditService = () => {
    setIsDialogOpen(true)
  }

  // Gérer l'ouverture du modal de confirmation pour supprimer le service
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression du service
  const confirmDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${salonId}/services/${currentService.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du service")
      }

      // Rediriger vers la liste des services
      router.push(`/admin/${salonId}/services`)
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer le succès de la modification du service
  const handleServiceSuccess = (updatedService: any) => {
    setCurrentService(updatedService)
    setIsDialogOpen(false)
    router.refresh()
  }

  // Filtrer les rendez-vous à venir
  const upcomingAppointments = appointments.filter((appointment: any) => {
    const appointmentDate = parseISO(appointment.date)
    return !isPast(appointmentDate)
  })

  // Calculer les statistiques
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter((appointment: any) => appointment.status === "COMPLETED").length
  const canceledAppointments = appointments.filter((appointment: any) => appointment.status === "CANCELLED").length
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
  const cancellationRate = totalAppointments > 0 ? (canceledAppointments / totalAppointments) * 100 : 0

  const stats = {
    totalAppointments,
    completedAppointments,
    canceledAppointments,
    completionRate,
    cancellationRate,
  }

  // Grouper les rendez-vous par date
  const appointmentsByDate = upcomingAppointments.reduce((acc: any, appointment: any) => {
    const dateStr = format(new Date(appointment.date), "yyyy-MM-dd")
    if (!acc[dateStr]) {
      acc[dateStr] = []
    }
    acc[dateStr].push(appointment)
    return acc
  }, {})

  // Obtenir les dates triées
  const sortedDates = Object.keys(appointmentsByDate).sort()

  // Fetch available users in the organization
  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`/api/organizations/${salonId}/users?role=BARBER`)
      if (response.ok) {
        const users = await response.json()
        setAvailableUsers(users)
      } else {
        console.error("Failed to fetch available users")
      }
    } catch (error) {
      console.error("Error fetching available users:", error)
    }
  }

  useEffect(() => {
    fetchAvailableUsers()
  }, [salonId])

  // Handle assigning a user to the service
  const handleAssignUser = async () => {

    if (!selectedUser) return

    try {
      const response = await fetch(`/api/organizations/${salonId}/services/${currentService.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUser }),
      })

      if (response.ok) {
        // Refresh the service details
        router.refresh()
        setIsAssignModalOpen(false)
        setSelectedUser(null)
      } else {
        console.error("Failed to assign user to service")
      }
    } catch (error) {
      console.error("Error assigning user to service:", error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <Link href={`/admin/${salonId}/services`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux services
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-none shadow-sm py-0">
            <div className="relative h-48 bg-gradient-to-r from-amber-500 to-amber-600">
              {currentService.image ? (
                <img
                  src={currentService.image || "/placeholder.svg"}
                  alt={currentService.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Scissors className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="font-bold text-2xl">{currentService.name}</h1>
                  <Badge className="mt-2 bg-white/20 text-white border-white/10">
                    {currentService.department?.label || "Département non spécifié"}
                  </Badge>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditService}
                  className="bg-white/20 text-white border-white/10 hover:bg-white/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="bg-white/20 text-white border-white/10 hover:bg-white/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistiques du service */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prix</p>
                    <h3 className="text-2xl font-bold text-amber-600">{currentService.price.toLocaleString()} FCFA</h3>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Durée: {convertMinutes(currentService.durationMin)} - {convertMinutes(currentService.durationMax)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Staff assigné</p>
                    <h3 className="text-2xl font-bold text-blue-600">{currentService.users?.length || 0}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {currentService.users?.length === 0
                    ? "Aucun staff assigné"
                    : currentService.users?.length === 1
                      ? "1 personne disponible"
                      : `${currentService.users?.length} personnes disponibles`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rendez-vous à venir</p>
                    <h3 className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {upcomingAppointments.length === 0
                    ? "Aucun rendez-vous prévu"
                    : upcomingAppointments.length === 1
                      ? "1 rendez-vous prévu"
                      : `${upcomingAppointments.length} rendez-vous prévus`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taux de complétion</p>
                    <h3 className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stats.totalAppointments} rendez-vous au total</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>

            {/* Onglet Staff */}
            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-amber-500" />
                    Staff assigné au service
                  </CardTitle>
                  <CardDescription>Liste des membres du personnel qui peuvent réaliser ce service</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentService.users && currentService.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentService.users.map((userService: any) => (
                        <Card key={userService.id} className="overflow-hidden border shadow-sm">
                          <div className="p-4 flex items-center space-x-4">
                            <Avatar className="h-12 w-12 border-2 border-amber-200">
                              <AvatarImage
                                src={userService.user.image || "/placeholder.svg"}
                                alt={userService.user.name}
                              />
                              <AvatarFallback className="bg-amber-100 text-amber-800">
                                {userService.user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{userService.user.name}</h4>
                              <p className="text-sm text-gray-500">{userService.user.email}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {userService.user.role || "Staff"}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun staff assigné</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Ce service n'a pas encore de personnel assigné. Vous pouvez assigner du personnel depuis la page
                        de gestion des utilisateurs.
                      </p>
                      <Button onClick={() => setIsAssignModalOpen(true)} className="mt-4" variant="outline">
                        Assigner un staff
                      </Button>
                    </div>
                  )}
                  <Link href={`/admin/${salonId}/users`}>
                    <Button className="mt-4" variant="outline">
                      Gérer le personnel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Rendez-vous */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                    Rendez-vous à venir
                  </CardTitle>
                  <CardDescription>Liste des rendez-vous programmés pour ce service</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-6">
                      {sortedDates.map((dateStr) => (
                        <div key={dateStr} className="space-y-3">
                          <h3 className="font-medium text-gray-700 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                            {format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr })}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {appointmentsByDate[dateStr].map((appointment: any) => (
                              <Card key={appointment.id} className="overflow-hidden border shadow-sm">
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarImage
                                          src={appointment.client?.image || "/placeholder.svg"}
                                          alt={appointment.client?.name}
                                        />
                                        <AvatarFallback className="bg-amber-100 text-amber-800">
                                          {appointment.firstName
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h4 className="font-medium">{appointment.firstName}</h4>
                                        <p className="text-xs text-gray-500">
                                          {appointment.phoneNumber || appointment.client?.email}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      className={
                                        appointment.status === "CONFIRMED"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : appointment.status === "PENDING"
                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                            : "bg-red-100 text-red-800 border-red-200"
                                      }
                                    >
                                      {appointment.status === "CONFIRMED"
                                        ? "Confirmé"
                                        : appointment.status === "PENDING"
                                          ? "En attente"
                                          : "Annulé"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {format(new Date(appointment.date), "HH:mm")}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <User className="h-4 w-4 mr-1" />
                                      {appointment.barber?.name || "Non assigné"}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun rendez-vous à venir</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Il n'y a pas de rendez-vous programmés pour ce service dans les prochains jours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Détails */}
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scissors className="h-5 w-5 mr-2 text-amber-500" />
                      Informations du service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                        <p className="text-gray-700">
                          {currentService.description || "Aucune description disponible pour ce service."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Prix</h4>
                          <p className="text-gray-700 font-medium">{currentService.price.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Département</h4>
                          <p className="text-gray-700">{currentService.department?.label || "Non spécifié"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Durée minimale</h4>
                          <p className="text-gray-700">{convertMinutes(currentService.durationMin)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Durée maximale</h4>
                          <p className="text-gray-700">{convertMinutes(currentService.durationMax)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-amber-500" />
                      Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-green-100 rounded-full mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">Complétés</p>
                          <p className="text-xl font-bold text-green-600">{stats.completedAppointments}</p>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-red-100 rounded-full mb-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">Annulés</p>
                          <p className="text-xl font-bold text-red-600">{stats.canceledAppointments}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Taux de complétion</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${stats.completionRate}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{stats.completionRate.toFixed(1)}%</span>
                          <span>{stats.totalAppointments} rendez-vous</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Taux d'annulation</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-red-600 h-2.5 rounded-full"
                            style={{ width: `${stats.cancellationRate}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{stats.cancellationRate.toFixed(1)}%</span>
                          <span>{stats.totalAppointments} rendez-vous</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Service Dialog */}
      <ServiceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        service={currentService}
        mode="edit"
        salonId={salonId}
        departments={departments}
        onSuccess={(updatedService) => handleServiceSuccess(updatedService)}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le service ?"
        description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce service ?"
      />

      {/* Assign Staff Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un staff</DialogTitle>
            <DialogDescription>Sélectionnez un staff pour ce service</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Staff</Label>
              <Select value={selectedUser || ""} onValueChange={(value) => setSelectedUser(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un staff" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Annuler
            </Button>
            <Button type="button" className="bg-amber-500 hover:bg-amber-600" onClick={handleAssignUser}>
              Assigner
            </Button>
          </DialogFooter>
          <Button type="button" variant="link" onClick={() => setIsCreateUserDialogOpen(true)}>
            Créer un nouveau staff
          </Button>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <UserDialog
        isOpen={isCreateUserDialogOpen}
        onClose={() => setIsCreateUserDialogOpen(false)}
        user={null}
        mode="create"
        salonId={salonId}
        onSuccess={() => {
          setIsCreateUserDialogOpen(false)
          fetchAvailableUsers()
        }}
      />
    </div>
  )
}
