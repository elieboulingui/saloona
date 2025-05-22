"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"

interface SalonSettingsFormProps {
  organization: {
    id: string
    name: string
    description: string | null
    address: string | null
    phone: string | null
    logoUrl: string | null
    imageCover: string | null
  }
}

export function SalonSettingsForm({ organization }: SalonSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
    address: organization?.address || "",
    phone: organization?.phone || "",
    logoUrl: organization?.logoUrl || "",
    imageCover: organization?.imageCover || "",
  })

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        address: organization.address || "",
        phone: organization.phone || "",
        logoUrl: organization.logoUrl || "",
        imageCover: organization.imageCover || "",
      })
    }
  }, [organization])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (name: string, url: string) => {
    setFormData((prev) => ({ ...prev, [name]: url }))
  }

  const handleDepartmentChange = (departmentIds: string[]) => {
    setFormData((prev:any) => ({ ...prev, departmentIds }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.address || !formData.phone) {
        setError("Veuillez remplir tous les champs obligatoires")
        setIsLoading(false)
        return
      }

      // Envoi des données au serveur
      const response = await fetch(`/api/organizations/${organization.id}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          logoUrl: formData.logoUrl,
          imageCover: formData.imageCover,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Une erreur est survenue lors de la mise à jour des paramètres")
        setIsLoading(false)
        return
      }

      toast.success("Paramètres du salon mis à jour avec succès")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom du salon</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Entrez le nom du salon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Entrez la description du salon"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Entrez l'adresse du salon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Entrez le numéro de téléphone du salon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <ImageUpload
          value={formData.logoUrl}
          onChange={(url) => handleImageChange("logoUrl", url)}
          disabled={isLoading}
          onLoading={setIsUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageCover">Image de couverture</Label>
        <ImageUpload
          value={formData.imageCover}
          onChange={(url) => handleImageChange("imageCover", url)}
          disabled={isLoading}
          onLoading={setIsUploading}
        />
      </div>

      <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          "Enregistrer les modifications"
        )}
      </Button>
    </form>
  )
}
