"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "./multi-select"

interface AppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  appointment?: any
  mode: "create" | "edit"
  salonId: string
  onSuccess: () => void
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AppointmentDialog({ isOpen, onClose, appointment, mode, salonId, onSuccess }: AppointmentDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    phoneNumber: "",
    date: new Date(),
    startDate: null as Date | null,
    endDate: null as Date | null,
    barberId: "",
    serviceIds: [] as string[],
    status: "PENDING",
    estimatedTime: "30min",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les coiffeurs et services
  const { data: barbers } = useSWR(`/api/organizations/${salonId}/users?role=BARBER`, fetcher)
  const { data: services } = useSWR(`/api/organizations/${salonId}/services`, fetcher)

  useEffect(() => {
    if (appointment && mode === "edit") {
      setFormData({
        firstName: appointment.firstName || "",
        phoneNumber: appointment.phoneNumber || "",
        date: appointment.date ? new Date(appointment.date) : new Date(),
        startDate: appointment.startDate ? new Date(appointment.startDate) : null,
        endDate: appointment.endDate ? new Date(appointment.endDate) : null,
        barberId: appointment.barber?.id || "",
        serviceIds: appointment.services
          ? appointment.services.map((appointmentService: any) => appointmentService.service.id)
          : [],
        status: appointment.status || "PENDING",
        estimatedTime: appointment.estimatedTime || "30min",
        notes: appointment.notes || "",
      })
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        firstName: "",
        phoneNumber: "",
        date: new Date(),
        startDate: null,
        endDate: null,
        barberId: "",
        serviceIds: [],
        status: "PENDING",
        estimatedTime: "30min",
        notes: "",
      })
    }
  }, [appointment, mode, isOpen])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const handleStartTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number)
    const newStartDate = new Date(formData.date)
    newStartDate.setHours(hours, minutes, 0, 0)
    setFormData((prev) => ({ ...prev, startDate: newStartDate }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServicesChange = (serviceIds: string[]) => {
    setFormData((prev) => ({ ...prev, serviceIds }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validation
      if (!formData.firstName || !formData.phoneNumber || !formData.date || formData.serviceIds.length === 0) {
        setError("Veuillez remplir tous les champs obligatoires et sélectionner au moins un service")
        setIsLoading(false)
        return
      }

      const formattedDate = format(formData.date, "yyyy-MM-dd")

      if (mode === "create") {
        // Créer un nouveau rendez-vous
        const response = await fetch(`/api/organizations/${salonId}/appointments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            phoneNumber: formData.phoneNumber,
            date: formattedDate,
            startDate: formData.startDate,
            endDate: formData.endDate,
            barberId: formData.barberId || undefined,
            serviceIds: formData.serviceIds,
            status: formData.status,
            estimatedTime: formData.estimatedTime,
            notes: formData.notes,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la création du rendez-vous")
        }
      } else {
        // Mettre à jour un rendez-vous existant
        const response = await fetch(`/api/organizations/${salonId}/appointments/${appointment.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            phoneNumber: formData.phoneNumber,
            date: formattedDate,
            startDate: formData.startDate,
            endDate: formData.endDate,
            barberId: formData.barberId || undefined,
            serviceIds: formData.serviceIds,
            status: formData.status,
            estimatedTime: formData.estimatedTime,
            notes: formData.notes,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la mise à jour du rendez-vous")
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

  // Générer les options d'heures pour le sélecteur
  const timeOptions = Array.from({ length: 24 }, (_, hour) => [
    `${hour.toString().padStart(2, "0")}:00`,
    `${hour.toString().padStart(2, "0")}:30`,
  ]).flat()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="firstName">Nom du client *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Nom du client"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Téléphone *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Numéro de téléphone"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.date} onSelect={handleDateChange} initialFocus locale={fr} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Heure de début</Label>
            <Select
              value={formData.startDate ? format(formData.startDate, "HH:mm") : ""}
              onValueChange={handleStartTimeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une heure" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barberId">Coiffeur</Label>
            <Select value={formData.barberId} onValueChange={(value) => handleSelectChange("barberId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un coiffeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Non assigné</SelectItem>
                {barbers?.map((barber: any) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services *</Label>
            <MultiSelect
              options={
                services?.map((service: any) => ({
                  value: service.id,
                  label: `${service.name} - ${service.price} €`,
                })) || []
              }
              selected={formData.serviceIds}
              onChange={handleServicesChange}
              placeholder="Sélectionner les services"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Temps estimé</Label>
            <Input
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleInputChange}
              placeholder="Ex: 30min, 1h, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ajouter des notes sur le rendez-vous"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
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
