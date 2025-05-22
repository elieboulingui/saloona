"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Loader2, Tag, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import useSWR from "swr"
import { AlertModal } from "../../components/alert-modal"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CategoryAdminPageClientProps {
  salonId: string
}

export default function CategoryAdminPageClient({ salonId }: CategoryAdminPageClientProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les catégories avec SWR
  const {
    data: categories,
    error: categoriesError,
    isLoading,
    mutate,
  } = useSWR(`/api/organizations/${salonId}/categories`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

  // Récupérer les produits pour compter combien il y en a par catégorie
  const { data: productsData } = useSWR(`/api/organizations/${salonId}/products`, fetcher)
  const products = productsData?.products || []

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

  // Filtrer les catégories en fonction de la recherche
  const filteredCategories =
    categories?.filter((category: any) => category.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  // Compter le nombre de produits par catégorie
  const getProductCount = (categoryId: string) => {
    return products.filter((product: any) => product.categoryId === categoryId).length
  }

  // Gérer la suppression d'une catégorie
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression d'une catégorie
  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      const response = await fetch(`/api/organizations/${salonId}/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la catégorie")
      }

      // Rafraîchir les données
      mutate()
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error)
    }
  }

  // Ajouter une nouvelle catégorie
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!newCategoryName.trim()) {
      setError("Le nom de la catégorie est requis")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/organizations/${salonId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la catégorie")
      }

      // Rafraîchir les données
      mutate()
      setIsAddModalOpen(false)
      setNewCategoryName("")
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error)
      setError("Une erreur est survenue lors de la création de la catégorie")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
      ) : categoriesError ? (
        <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des catégories</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Search and Add button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une catégorie..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Categories list */}
          {filteredCategories.length > 0 ? (
            <div className="grid gap-3">
              <AnimatePresence>
                {filteredCategories.map((category: any) => {
                  const productCount = getProductCount(category.id)

                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      layout
                      whileHover={{ y: -2 }}
                      className="relative"
                    >
                      <Card className="overflow-hidden border shadow-sm">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className="bg-amber-100 p-2 rounded-full mr-3">
                                <Tag className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{category.name}</h3>
                                <div className="flex items-center mt-1">
                                  <Package className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                  <span className="text-xs text-gray-500">
                                    {productCount} produit{productCount !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full hover:bg-red-50"
                                onClick={() => handleDeleteClick(category)}
                                disabled={productCount > 0}
                                title={
                                  productCount > 0
                                    ? "Impossible de supprimer une catégorie contenant des produits"
                                    : "Supprimer la catégorie"
                                }
                              >
                                <Trash2 className={`h-5 w-5 ${productCount > 0 ? "text-gray-300" : "text-red-500"}`} />
                              </motion.button>
                            </div>
                          </div>
                        </CardContent>
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
                <Tag className="h-8 w-8 text-gray-400" />
              </motion.div>
              <p>Aucune catégorie trouvée</p>
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
        onClick={() => setIsAddModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie ?"
        description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette catégorie ?"
      />

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nom de la catégorie</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Huiles essentielles"
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

