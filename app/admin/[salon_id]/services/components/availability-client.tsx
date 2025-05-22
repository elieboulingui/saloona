"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import useSWR from "swr"

// Fonction pour convertir les minutes en format HH:MM
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

// Fonction pour convertir le format HH:MM en minutes
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

interface AvailabilityClientProps {
    salonId : string
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erreur de chargement")
    return res.json()
  })
  
  
export default function AvailabilityClient({ salonId }: AvailabilityClientProps) {
    
    const { data, error: fetchError, isLoading } = useSWR(
      `/api/organizations/${salonId}/availability`,
      fetcher
    )
  
    const [formData, setFormData] = useState({
      mondayOpen: true,
      tuesdayOpen: true,
      wednesdayOpen: true,
      thursdayOpen: true,
      fridayOpen: true,
      saturdayOpen: true,
      sundayOpen: false,
      openingTime: "09:00",
      closingTime: "18:00",
      lunchBreakStart: "",
      lunchBreakEnd: "",
      appointmentInterval: 15,
      preparationTime: 0,
      cleanupTime: 0,
    })
  
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
  
    // Remplir les données du formulaire à partir des données SWR
    useEffect(() => {
      if (data) {
        setFormData({
          mondayOpen: data.mondayOpen,
          tuesdayOpen: data.tuesdayOpen,
          wednesdayOpen: data.wednesdayOpen,
          thursdayOpen: data.thursdayOpen,
          fridayOpen: data.fridayOpen,
          saturdayOpen: data.saturdayOpen,
          sundayOpen: data.sundayOpen,
          openingTime: minutesToTimeString(data.openingTime),
          closingTime: minutesToTimeString(data.closingTime),
          lunchBreakStart: data.lunchBreakStart ? minutesToTimeString(data.lunchBreakStart) : "",
          lunchBreakEnd: data.lunchBreakEnd ? minutesToTimeString(data.lunchBreakEnd) : "",
          appointmentInterval: data.appointmentInterval,
          preparationTime: data.preparationTime,
          cleanupTime: data.cleanupTime,
        })
      }
    }, [data])
  
    const handleChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSaving(true)
      setSubmitError(null)
      setSuccess(false)
  
      try {
        const dataToSend = {
          mondayOpen: formData.mondayOpen,
          tuesdayOpen: formData.tuesdayOpen,
          wednesdayOpen: formData.wednesdayOpen,
          thursdayOpen: formData.thursdayOpen,
          fridayOpen: formData.fridayOpen,
          saturdayOpen: formData.saturdayOpen,
          sundayOpen: formData.sundayOpen,
          openingTime: timeStringToMinutes(formData.openingTime),
          closingTime: timeStringToMinutes(formData.closingTime),
          lunchBreakStart: formData.lunchBreakStart ? timeStringToMinutes(formData.lunchBreakStart) : null,
          lunchBreakEnd: formData.lunchBreakEnd ? timeStringToMinutes(formData.lunchBreakEnd) : null,
          appointmentInterval: formData.appointmentInterval,
          preparationTime: formData.preparationTime,
          cleanupTime: formData.cleanupTime,
        }
  
        const response = await fetch(`/api/organizations/${salonId}/availability`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la mise à jour")
        }
  
        setSuccess(true)
      } catch (err: any) {
        console.error("Erreur:", err)
        setSubmitError(err.message)
      } finally {
        setSaving(false)
      }
    }
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
  
    if (fetchError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger les disponibilités</AlertDescription>
        </Alert>
      )
    }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilités du salon</CardTitle>
          <CardDescription>Configurez les jours et heures d'ouverture de votre salon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Succès</AlertTitle>
                <AlertDescription>Les disponibilités ont été mises à jour avec succès.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Jours d'ouverture</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monday"
                    checked={formData.mondayOpen}
                    onCheckedChange={(checked) => handleChange("mondayOpen", checked)}
                  />
                  <Label htmlFor="monday">Lundi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tuesday"
                    checked={formData.tuesdayOpen}
                    onCheckedChange={(checked) => handleChange("tuesdayOpen", checked)}
                  />
                  <Label htmlFor="tuesday">Mardi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wednesday"
                    checked={formData.wednesdayOpen}
                    onCheckedChange={(checked) => handleChange("wednesdayOpen", checked)}
                  />
                  <Label htmlFor="wednesday">Mercredi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="thursday"
                    checked={formData.thursdayOpen}
                    onCheckedChange={(checked) => handleChange("thursdayOpen", checked)}
                  />
                  <Label htmlFor="thursday">Jeudi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="friday"
                    checked={formData.fridayOpen}
                    onCheckedChange={(checked) => handleChange("fridayOpen", checked)}
                  />
                  <Label htmlFor="friday">Vendredi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saturday"
                    checked={formData.saturdayOpen}
                    onCheckedChange={(checked) => handleChange("saturdayOpen", checked)}
                  />
                  <Label htmlFor="saturday">Samedi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sunday"
                    checked={formData.sundayOpen}
                    onCheckedChange={(checked) => handleChange("sundayOpen", checked)}
                  />
                  <Label htmlFor="sunday">Dimanche</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Heures d'ouverture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingTime">Heure d'ouverture</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => handleChange("openingTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingTime">Heure de fermeture</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => handleChange("closingTime", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pause déjeuner (optionnel)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunchBreakStart">Début de la pause</Label>
                  <Input
                    id="lunchBreakStart"
                    type="time"
                    value={formData.lunchBreakStart}
                    onChange={(e) => handleChange("lunchBreakStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunchBreakEnd">Fin de la pause</Label>
                  <Input
                    id="lunchBreakEnd"
                    type="time"
                    value={formData.lunchBreakEnd}
                    onChange={(e) => handleChange("lunchBreakEnd", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paramètres des rendez-vous</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentInterval">Intervalle entre les rendez-vous (minutes)</Label>
                  <Input
                    id="appointmentInterval"
                    type="number"
                    min="5"
                    value={formData.appointmentInterval}
                    onChange={(e) => handleChange("appointmentInterval", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preparationTime">Temps de préparation (minutes)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="0"
                    value={formData.preparationTime}
                    onChange={(e) => handleChange("preparationTime", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cleanupTime">Temps de nettoyage (minutes)</Label>
                  <Input
                    id="cleanupTime"
                    type="number"
                    min="0"
                    value={formData.cleanupTime}
                    onChange={(e) => handleChange("cleanupTime", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Enregistrement..." : "Enregistrer les disponibilités"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
