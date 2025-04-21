"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Loader2, Package, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductDialog } from "./product-dialog"
import { AlertModal } from "./alert-modal"
import { deleteProduct } from "../actions"
import Image from "next/image"
import useSWR from "swr"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BoutiqueAdminPageClientProps {
  salonId: string
}

export default function BoutiqueAdminPageClient({salonId}: BoutiqueAdminPageClientProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Récupérer les produits et catégories avec SWR
  const { data, error, isLoading, mutate } = useSWR(`/api/organizations/${salonId}/products`, fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

  const products = data?.products || []
  const categories = data?.categories || []

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

  // Filtrer les produits en fonction de la recherche et de la catégorie
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true

    return matchesSearch && matchesCategory
  })

  // Gérer l'ajout d'un nouveau produit
  const handleAddProduct = () => {
    setSelectedProduct(null)
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  // Gérer la modification d'un produit
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  // Gérer la suppression d'un produit
  const handleDeleteClick = (product: any) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  // Confirmer la suppression d'un produit
  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)

      // Rafraîchir les données
      mutate()
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
    }
  }

  // Gérer la fermeture du dialogue avec succès
  const handleDialogSuccess = () => {
    // Rafraîchir les données
    mutate()
    setIsDialogOpen(false)
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
      ) : error ? (
        <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des produits</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                selectedCategory === null ? "bg-amber-100 text-amber-800" : ""
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Toutes les catégories
            </Badge>
            {categories.map((category: any) => (
              <Badge
                key={category.id}
                variant="outline"
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === category.id ? "bg-amber-100 text-amber-800" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Products list */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {filteredProducts.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -5 }}
                    className="relative"
                  >
                    <Card className="overflow-hidden border shadow-sm py-0">
                      <div className="relative h-32 w-full bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="bg-white p-1.5 rounded-full shadow-sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-500" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="bg-white p-1.5 rounded-full shadow-sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </motion.button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-amber-500 font-bold text-sm">
                            {product.price.toLocaleString()} FCFA
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Stock: {product.stock}
                          </Badge>
                        </div>
                        {product.category && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {product.category.name}
                          </Badge>
                        )}
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
                <Package className="h-8 w-8 text-gray-400" />
              </motion.div>
              <p>Aucun produit trouvé</p>
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
        onClick={handleAddProduct}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Product Dialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={selectedProduct}
        mode={dialogMode}
        categories={categories}
        onSuccess={handleDialogSuccess}
        salonId={salonId}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit ?"
        description="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce produit ?"
      />
    </div>
  )
}

