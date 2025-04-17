"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Loader2, Clock, Edit, Trash2, BriefcaseBusiness, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ServiceDialog } from "./components/service-dialog"
import { AlertModal } from "./components/alert-modal"
import { deleteService } from "./actions"
import Image from "next/image"
import useSWR from "swr"
import Link from "next/link"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ServicesAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<any>(null)

  // Récupérer les services avec SWR
  const {
    data: services,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/services", fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

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

  // Filtrer les services en fonction de la recherche
  const filteredServices =
    services?.filter(
      (service: any) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  // Gérer l'ajout d'un nouveau service
  const handleAddService = () => {
    setSelectedService(null)
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  // Gérer la modification d'un service
  const handleEditService = (service: any) => {
    setSelectedService(service)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  // Gérer la suppression d'un service
  const handleDeleteClick = (service: any) => {
    setServiceToDelete(service)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression d'un service
  const confirmDelete = async () => {
    if (!serviceToDelete) return

    try {
      await deleteService(serviceToDelete.id)

      // Rafraîchir les données
      mutate()
      setIsDeleteModalOpen(false)
      setServiceToDelete(null)
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error)
    }
  }

  // Gérer la fermeture du dialogue avec succès
  const handleDialogSuccess = () => {
    // Rafraîchir les données
    mutate()
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Services</h1>
            <p className="text-white/80 text-xs">Gérez vos services en toute simplicité</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-amber-500" />
            </motion.div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des services</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un service..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Services list */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence>
                  {filteredServices.map((service: any) => (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      layout
                      whileHover={{ y: -5 }}
                      className="relative"
                    >
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="flex">
                          <div className="relative h-32 w-32 bg-gray-100">
                            {service.image ? (
                              <Image
                                src={service.image || "/placeholder.svg"}
                                alt={service.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BriefcaseBusiness className="h-10 w-10 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{service.name}</h3>
                              <div className="flex gap-1">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-full hover:bg-gray-100"
                                  onClick={() => handleEditService(service)}
                                >
                                  <Edit className="h-4 w-4 text-amber-500" />
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-full hover:bg-gray-100"
                                  onClick={() => handleDeleteClick(service)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </motion.button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{service.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.durationMin}-{service.durationMax} min
                              </Badge>
                              <span className="font-bold text-amber-500">{service.price.toLocaleString()} FCFA</span>
                            </div>
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
                  <BriefcaseBusiness className="h-8 w-8 text-gray-400" />
                </motion.div>
                <p>Aucun service trouvé</p>
                {searchTerm && (
                  <Button variant="link" className="mt-2 text-amber-500" onClick={() => setSearchTerm("")}>
                    Effacer la recherche
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Floating action button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg"
          onClick={handleAddService}
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        {/* Service Dialog */}
        <ServiceDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          service={selectedService}
          mode={dialogMode}
          onSuccess={handleDialogSuccess}
        />

        {/* Delete Confirmation Modal */}
        <AlertModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Supprimer le service ?"
          description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce service ?"
        />
      </div>
    </div>
  )
}

