"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Loader2, Scissors, Clock, Edit, Trash2, UserPlus, PlusIcon, Filter } from "lucide-react"
import { ServiceDialog } from "./service-dialog"
import { AlertModal } from "./alert-modal"
import { convertMinutes } from "@/lib/utils"

interface ServicesClientProps {
  initialServices: any[]
  departments: any[]
  salonId: string
}

export function ServicesClient({ initialServices, departments, salonId }: ServicesClientProps) {

  const router = useRouter()
  const [services, setServices] = useState(initialServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isLoading, setIsLoading] = useState(false)

  // Filtrer les services en fonction de la recherche
  const filteredServices = services.filter(
    (service: any) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.department?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Gérer l'ouverture du dialogue pour créer un service
  const handleCreateService = () => {
    setSelectedService(null)
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  // Gérer l'ouverture du dialogue pour modifier un service
  const handleEditService = (service: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedService(service)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  // Gérer l'ouverture du modal de confirmation pour supprimer un service
  const handleDeleteClick = (service: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedService(service)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression d'un service
  const confirmDelete = async () => {
    if (!selectedService) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/organizations/${salonId}/services/${selectedService.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du service")
      }

      // Mettre à jour l'état local
      setServices((prev) => prev.filter((service) => service.id !== selectedService.id))
      setIsDeleteModalOpen(false)
      setSelectedService(null)
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer le succès de la création ou modification d'un service
  const handleServiceSuccess = (updatedService: any, mode: "create" | "edit") => {
    if (mode === "create") {
      setServices((prev) => [...prev, updatedService])
    } else {
      setServices((prev) => prev.map((service) => (service.id === updatedService.id ? updatedService : service)))
    }
    setIsDialogOpen(false)
    router.refresh()
  }

  // Gérer le clic sur un service pour voir les détails
  const handleServiceClick = (service: any) => {
    router.push(`/admin/${salonId}/services/${service.id}`)
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
    <>
      <div className="flex justify-between items-center mb-1 gap-2 py-4 px-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un service..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateService}
 className="bg-amber-500 hover:bg-amber-600 text-white">
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-amber-500" />
          </motion.div>
        </div>
      ) : filteredServices.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredServices.map((service: any) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                layout
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow py-0">
                  <CardContent className="p-0">
                    <div className="relative h-40 bg-gradient-to-r from-amber-500 to-amber-600">
                      {service.image ? (
                        <img
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Scissors className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="font-bold text-lg">{service.name}</h3>
                          <p className="text-white/80 text-sm line-clamp-1">{service.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          {service.department?.label || "Département non spécifié"}
                        </Badge>
                        <span className="font-bold text-amber-600">{service.price.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {convertMinutes(service.durationMin)} - {convertMinutes(service.durationMax)}
                        </span>
                      </div>
                      <div className="flex justify-end mt-3 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={(e) => handleEditService(service, e)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={(e) => handleDeleteClick(service, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun service trouvé</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? "Aucun service ne correspond à votre recherche" : "Vous n'avez pas encore ajouté de services"}
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Effacer la recherche
            </Button>
          ) : (
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleCreateService}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier service
            </Button>
          )}
        </div>
      )}

      {/* Service Dialog */}
      <ServiceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        service={selectedService}
        mode={dialogMode}
        salonId={salonId}
        departments={departments}
        onSuccess={handleServiceSuccess}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le service ?"
        description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce service ?"
      />
    </>
  )
}
