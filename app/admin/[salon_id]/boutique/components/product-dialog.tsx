"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createProduct, updateProduct } from "../actions"
import { ImageUpload } from "@/components/image-upload"

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  product: any
  mode: "create" | "edit"
  categories: any[]
  onSuccess: () => void
  salonId : string
}

export function ProductDialog({ isOpen, onClose, product, mode, categories, onSuccess, salonId }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        categoryId: product.categoryId || "",
        image: product.image || "",
      })
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        image: "",
      })
    }
  }, [product, mode, isOpen, categories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
        setError("Veuillez remplir tous les champs obligatoires")
        setIsLoading(false)
        return
      }

      const productData = {
        ...formData,
        price: Number.parseInt(formData.price),
        stock: Number.parseInt(formData.stock),
        organizationId : salonId 
      }

      let result

      if (mode === "create") {
        result = await createProduct(productData)
      } else {
        result = await updateProduct(product.id, productData)
      }

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Une erreur est survenue")
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormDisabled = isLoading || isUploading

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Ajouter un produit" : "Modifier le produit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez le nom du produit"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Entrez la description du produit"
              rows={3}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 5000"
                required
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Ex: 10"
                required
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.categoryId} onValueChange={handleCategoryChange} disabled={isFormDisabled}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image du produit</Label>
            <ImageUpload
              value={formData.image}
              onChange={handleImageChange}
              disabled={isFormDisabled}
              onLoading={setIsUploading}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isFormDisabled}>
              Annuler
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isFormDisabled}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : mode === "create" ? (
                "Ajouter"
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

