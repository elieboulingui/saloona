"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { MultiSelect } from "../../components/multi-select"
import useSWR from "swr"
import { ImageUpload } from "@/components/image-upload"

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  user: any
  mode: "create" | "edit"
  salonId: string
  onSuccess: () => void
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function UserDialog({ isOpen, onClose, user, mode, salonId, onSuccess }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CLIENT",
    password: "",
    speciality: "",
    image: "",
  })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer tous les services disponibles
  const { data: servicesData } = useSWR(`/api/organizations/${salonId}/services`, fetcher)
  const services = servicesData || []

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "CLIENT",
        password: "", // Ne pas remplir le mot de passe en mode édition
        speciality: user.speciality || "",
        image: user.image || "",
      })

      // Initialiser les services sélectionnés si disponibles
      if (user && user.services) {
        setSelectedServices(user.services.map((service: any) => service.service.id))
      }
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "CLIENT",
        password: "",
        speciality: "",
        image: "",
      })
      setSelectedServices([])
    }
  }, [user, mode, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))
  }

  const handleServicesChange = (serviceIds: string[]) => {
    setSelectedServices(serviceIds)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === "create") {
        // Validation
        if (!formData.name || !formData.email || !formData.password) {
          setError("Veuillez remplir tous les champs obligatoires")
          setIsLoading(false)
          return
        }

        // Créer un nouvel utilisateur
        const response = await fetch(`/api/organizations/${salonId}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la création de l'utilisateur")
        }

        const userData = await response.json()

        // Si l'utilisateur est un coiffeur et des services sont sélectionnés, les associer
        if (formData.role === "BARBER" && selectedServices.length > 0) {
          await fetch(`/api/organizations/${salonId}/users/${userData.id}/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ serviceIds: selectedServices }),
          })
        }
      } else {
        // Validation
        if (!formData.name || !formData.email) {
          setError("Veuillez remplir tous les champs obligatoires")
          setIsLoading(false)
          return
        }

        // Mettre à jour un utilisateur existant
        const response = await fetch(`/api/organizations/${salonId}/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            speciality: formData.speciality,
            image: formData.image,
            // N'envoyer le mot de passe que s'il est rempli
            ...(formData.password ? { password: formData.password } : {}),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la mise à jour de l'utilisateur")
        }

        // Si l'utilisateur est un coiffeur, mettre à jour ses services
        if (formData.role === "BARBER") {
          const servicesResponse = await fetch(`/api/organizations/${salonId}/users/${user.id}/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ serviceIds: selectedServices }),
          })

          if (!servicesResponse.ok) {
            console.error("Erreur lors de la mise à jour des services:", await servicesResponse.text())
          }
        }
      }

      // Succès
      onSuccess()
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
          <DialogTitle>{mode === "create" ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">Photo de profil</Label>
            <ImageUpload
              value={formData.image}
              onChange={handleImageChange}
              disabled={isFormDisabled}
              onLoading={setIsUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez le nom complet"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez l'adresse email"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Entrez le numéro de téléphone"
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={isFormDisabled}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
                <SelectItem value="BARBER">Coiffeur</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "BARBER" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="speciality">Spécialité</Label>
                <Input
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  placeholder="Entrez la spécialité du coiffeur"
                  disabled={isFormDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services proposés</Label>
                <MultiSelect
                  options={services.map((service: any) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                  selected={selectedServices}
                  onChange={handleServicesChange}
                  placeholder="Sélectionner les services"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "create" ? "Mot de passe *" : "Nouveau mot de passe (laisser vide pour ne pas changer)"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={mode === "create" ? "Entrez le mot de passe" : "Laisser vide pour ne pas changer"}
              required={mode === "create"}
              disabled={isFormDisabled}
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
