"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createService, updateService } from "../actions"
import { ImageUpload } from "@/components/image-upload"

interface ServiceDialogProps {
  isOpen: boolean
  onClose: () => void
  service: any
  mode: "create" | "edit"
  onSuccess: () => void
}

export function ServiceDialog({ isOpen, onClose, service, mode, onSuccess }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMin: "",
    durationMax: "",
    image: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (service && mode === "edit") {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price?.toString() || "",
        durationMin: service.durationMin?.toString() || "",
        durationMax: service.durationMax?.toString() || "",
        image: service.image || "",
      })
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: "",
        description: "",
        price: "",
        durationMin: "",
        durationMax: "",
        image: "",
      })
    }
  }, [service, mode, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      if (!formData.name || !formData.price || !formData.durationMin || !formData.durationMax) {
        setError("Veuillez remplir tous les champs obligatoires")
        setIsLoading(false)
        return
      }

      const serviceData = {
        ...formData,
        price: Number.parseInt(formData.price),
        durationMin: Number.parseInt(formData.durationMin),
        durationMax: Number.parseInt(formData.durationMax),
      }

      let result

      if (mode === "create") {
        result = await createService(serviceData)
      } else {
        result = await updateService(service.id, serviceData)
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Ajouter un service" : "Modifier le service"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom du service *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez le nom du service"
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
              placeholder="Entrez la description du service"
              rows={3}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 15000"
                required
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMin">Durée min (min) *</Label>
              <Input
                id="durationMin"
                name="durationMin"
                type="number"
                value={formData.durationMin}
                onChange={handleChange}
                placeholder="Ex: 30"
                required
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMax">Durée max (min) *</Label>
              <Input
                id="durationMax"
                name="durationMax"
                type="number"
                value={formData.durationMax}
                onChange={handleChange}
                placeholder="Ex: 60"
                required
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image du service</Label>
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

