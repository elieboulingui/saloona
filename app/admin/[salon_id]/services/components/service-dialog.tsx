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
import { ImageUpload } from "@/components/image-upload"

interface ServiceDialogProps {
  isOpen: boolean
  onClose: () => void
  service: any
  mode: "create" | "edit"
  salonId: string
  departments: any[]
  onSuccess: (service: any, mode: "create" | "edit") => void
}

export function ServiceDialog({ isOpen, onClose, service, mode, salonId, departments, onSuccess }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMin: "",
    durationMax: "",
    image: "",
    departmentId: "",
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
        departmentId: service.departmentId || service.department?.id || "",
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
        departmentId: departments && departments.length > 0 ? departments[0].id : "",
      })
    }
  }, [service, mode, isOpen, departments])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, departmentId: value }))
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
      if (
        !formData.name ||
        !formData.price ||
        !formData.durationMin ||
        !formData.durationMax ||
        !formData.departmentId
      ) {
        setError("Veuillez remplir tous les champs obligatoires")
        setIsLoading(false)
        return
      }

      let response, updatedService

      if (mode === "create") {
        // Créer un nouveau service
        response = await fetch(`/api/organizations/${salonId}/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            durationMin: Number(formData.durationMin),
            durationMax: Number(formData.durationMax),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la création du service")
        }

        updatedService = await response.json()
      } else {
        // Mettre à jour un service existant
        response = await fetch(`/api/organizations/${salonId}/services/${service.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            durationMin: Number(formData.durationMin),
            durationMax: Number(formData.durationMax),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la mise à jour du service")
        }

        updatedService = await response.json()
      }

      // Succès
      onSuccess(updatedService, mode)
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
              <Label htmlFor="departmentId">Département *</Label>
              <Select value={formData.departmentId} onValueChange={handleDepartmentChange} disabled={isFormDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((department: any) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="image">Image du service</Label>
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
                "Créer"
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
