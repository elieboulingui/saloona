"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2, ChevronRight, ChevronLeft, Check, CreditCard, Banknote, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AppointmentSheetProps {
  isOpen: boolean
  onClose: () => void
  appointment?: any
  mode: "create" | "edit"
  salonId: string
  onSuccess: () => void
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AppointmentSheet({ isOpen, onClose, appointment, mode, salonId, onSuccess }: AppointmentSheetProps) {
  // État pour suivre l'étape actuelle
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    phoneNumber: "",
    date: new Date(),
    hourAppointment: "", // Format: "10:30"
    startDate: null as Date | null, // Doit être null lors de la création
    endDate: null as Date | null,
    barberId: "",
    serviceIds: [] as string[],
    status: "PENDING",
    estimatedTime: 0, // En minutes
    notes: "",
    paymentMethod: "cash", // "cash" ou "mobile"
    mobileMoneyNumber: "",
    cashAmount: 0,
    changeAmount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  // Récupérer les coiffeurs et services
  const { data: barbers } = useSWR(`/api/organizations/${salonId}/users?role=BARBER`, fetcher)
  const { data: services } = useSWR(`/api/organizations/${salonId}/services`, fetcher)
  const { data: organizationAvailability } = useSWR(`/api/organizations/${salonId}/availability`, fetcher)

  // Récupérer les créneaux disponibles en fonction de la date et du coiffeur sélectionnés
  const { data: availabilityData, error: availabilityError } = useSWR(
    formData.date && isOpen
      ? `/api/organizations/${salonId}/availability/slots?date=${format(formData.date, "yyyy-MM-dd")}&barberId=${formData.barberId}`
      : null,
    fetcher,
  )

  // Mettre à jour les créneaux disponibles lorsque les données d'availability changent
  useEffect(() => {
    if (availabilityData && availabilityData.slots) {
      setAvailableTimeSlots(availabilityData.slots)
    }
  }, [availabilityData])

  // Filtrer les coiffeurs en fonction des services sélectionnés
  const filteredBarbers =
    barbers?.filter((barber: any) => {
      // Si aucun service n'est sélectionné, afficher tous les coiffeurs
      if (formData.serviceIds.length === 0) return true

      // Vérifier si le coiffeur est assigné à au moins un des services sélectionnés
      return formData.serviceIds.some((serviceId) => {
        const service = services?.find((s: any) => s.id === serviceId)
        return service?.users?.some((user: any) => user.userId === barber.id)
      })
    }) || []

  // Calculer le total des services sélectionnés
  const calculateTotal = () => {
    if (!services) return 0
    return formData.serviceIds.reduce((total, serviceId) => {
      const service = services.find((s: any) => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
  }

  useEffect(() => {
    if (appointment && mode === "edit") {
      // Définir barberId correctement - s'il n'y a pas de barberId, utiliser "unassigned"
      const currentBarberId = appointment.barberId || "unassigned"

      // Convertir estimatedTime en nombre si c'est une chaîne
      let estimatedTimeValue = appointment.estimatedTime
      if (typeof estimatedTimeValue === "string") {
        // Si c'est une chaîne comme "30min" ou "1h30", convertir en minutes
        if (estimatedTimeValue.includes("h")) {
          const [hours, mins] = estimatedTimeValue.split("h")
          estimatedTimeValue = Number.parseInt(hours) * 60 + (mins ? Number.parseInt(mins) : 0)
        } else {
          estimatedTimeValue = Number.parseInt(estimatedTimeValue)
        }
      }

      setFormData({
        firstName: appointment.firstName || "",
        phoneNumber: appointment.phoneNumber || "",
        date: appointment.date ? new Date(appointment.date) : new Date(),
        hourAppointment: appointment.hourAppointment || "",
        startDate: appointment.startDate ? new Date(appointment.startDate) : null,
        endDate: appointment.endDate ? new Date(appointment.endDate) : null,
        barberId: currentBarberId,
        serviceIds: appointment.services
          ? appointment.services.map((appointmentService: any) => appointmentService.service.id)
          : [],
        status: appointment.status || "PENDING",
        estimatedTime: estimatedTimeValue || 0,
        notes: appointment.notes || "",
        paymentMethod: "cash",
        mobileMoneyNumber: "",
        cashAmount: 0,
        changeAmount: 0,
      })
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        firstName: "",
        phoneNumber: "",
        date: new Date(),
        hourAppointment: "",
        startDate: null, // Doit être null lors de la création
        endDate: null,
        barberId: "unassigned", // Par défaut, non assigné
        serviceIds: [],
        status: "PENDING",
        estimatedTime: 0,
        notes: "",
        paymentMethod: "cash",
        mobileMoneyNumber: "",
        cashAmount: 0,
        changeAmount: 0,
      })
    }

    // Réinitialiser l'étape à 1 à chaque ouverture
    setCurrentStep(1)
  }, [appointment, mode, isOpen])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date, hourAppointment: "" })) // Réinitialiser l'heure lors du changement de date
    }
  }

  const handleHourAppointmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, hourAppointment: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "barberId") {
      // Réinitialiser l'heure sélectionnée lors du changement de coiffeur
      setFormData((prev) => ({ ...prev, [name]: value, hourAppointment: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleBarberSelect = (barberId: string) => {
    // Réinitialiser l'heure sélectionnée lors du changement de coiffeur
    setFormData((prev) => ({ ...prev, barberId, hourAppointment: "" }))
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const isSelected = prev.serviceIds.includes(serviceId)
      let newServiceIds

      if (isSelected) {
        newServiceIds = prev.serviceIds.filter((id) => id !== serviceId)
      } else {
        newServiceIds = [...prev.serviceIds, serviceId]
      }

      // Calculer le temps estimé en fonction des services sélectionnés
      let totalEstimatedTime = 0
      if (services) {
        newServiceIds.forEach((id) => {
          const service = services.find((s: any) => s.id === id)
          if (service) {
            // Utiliser la moyenne entre durationMin et durationMax
            totalEstimatedTime += Math.floor((service.durationMin + service.durationMax) / 2)
          }
        })
      }

      return {
        ...prev,
        serviceIds: newServiceIds,
        estimatedTime: totalEstimatedTime || 0,
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "cashAmount") {
      const cashAmount = Number(value)
      const changeAmount = cashAmount - calculateTotal()
      setFormData((prev) => ({
        ...prev,
        [name]: cashAmount,
        changeAmount: changeAmount > 0 ? changeAmount : 0,
      }))
    } else if (name === "estimatedTime") {
      // Convertir en nombre pour estimatedTime
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Validation
      if (
        !formData.firstName ||
        !formData.phoneNumber ||
        !formData.date ||
        formData.serviceIds.length === 0 ||
        !formData.hourAppointment
      ) {
        setError("Veuillez remplir tous les champs obligatoires")
        setIsLoading(false)
        return
      }

      const formattedDate = format(formData.date, "yyyy-MM-dd")

      // Traiter correctement le barberId
      const finalBarberId = formData.barberId === "unassigned" ? null : formData.barberId

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
            hourAppointment: formData.hourAppointment,
            startDate: null, // Doit être null lors de la création
            endDate: null,
            barberId: finalBarberId,
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
            hourAppointment: formData.hourAppointment,
            startDate: formData.startDate,
            endDate: formData.endDate,
            barberId: finalBarberId,
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
      onClose()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour passer à l'étape suivante
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Vérifier si on peut passer à l'étape suivante
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Informations client
        return formData.firstName.trim().length >= 3 && /^[0-9]{8,9}$/.test(formData.phoneNumber.trim())
      case 2: // Sélection des services
        return formData.serviceIds.length > 0
      case 3: // Sélection du coiffeur
        return true // On peut toujours passer, car "Non assigné" est une option valide
      case 4: // Sélection du jour et de l'heure
        return formData.date && formData.hourAppointment
      default:
        return true
    }
  }

  // Formater la durée en heures et minutes
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0 min"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
  }

  // Grouper les créneaux horaires par heure pour une meilleure organisation
  const groupedTimeSlots = availableTimeSlots.reduce(
    (acc, slot) => {
      const hour = slot.split(":")[0]
      if (!acc[hour]) {
        acc[hour] = []
      }
      acc[hour].push(slot)
      return acc
    },
    {} as Record<string, string[]>,
  )

  // Rendu du contenu en fonction de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Informations client
        return (
          <div className="space-y-4">
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
          </div>
        )

      case 2: // Sélection des services
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">Sélectionnez un ou plusieurs services</div>

            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {services?.map((service: any) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all py-0",
                    formData.serviceIds.includes(service.id) ? "border-amber-500 bg-amber-50" : "hover:border-gray-300",
                  )}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <span>
                          {service.durationMin}-{service.durationMax} min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-amber-600">{service.price} FCFA</span>
                      {formData.serviceIds.includes(service.id) && <Badge className="bg-amber-500">Sélectionné</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.serviceIds.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Services sélectionnés:</span>
                  <span>{formData.serviceIds.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Durée estimée:</span>
                  <span>{formatDuration(formData.estimatedTime)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{calculateTotal()} FCFA</span>
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Sélection du coiffeur
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Sélectionnez un coiffeur ou laissez "Non assigné" pour n'importe lequel
            </div>

            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              <Card
                key="unassigned"
                className={cn(
                  "cursor-pointer transition-all py-0",
                  formData.barberId === "unassigned" ? "border-amber-500 bg-amber-50" : "hover:border-gray-300",
                )}
                onClick={() => handleBarberSelect("unassigned")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200 text-gray-600">NA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Non assigné</div>
                    <div className="text-sm text-muted-foreground">N'importe quel coiffeur disponible</div>
                  </div>
                  {formData.barberId === "unassigned" && <Check className="ml-auto h-5 w-5 text-amber-500" />}
                </CardContent>
              </Card>

              {filteredBarbers?.map((barber: any) => (
                <Card
                  key={barber.id}
                  className={cn(
                    "cursor-pointer transition-all py-0",
                    formData.barberId === barber.id ? "border-amber-500 bg-amber-50" : "hover:border-gray-300",
                  )}
                  onClick={() => handleBarberSelect(barber.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={barber.image || ""} alt={barber.name} />
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        {barber.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{barber.name}</div>
                      {barber.speciality && <div className="text-sm text-muted-foreground">{barber.speciality}</div>}
                    </div>
                    {formData.barberId === barber.id && <Check className="ml-auto h-5 w-5 text-amber-500" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 4: // Sélection du jour et de l'heure
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date du rendez-vous *</Label>
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
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourAppointment">Heure du rendez-vous *</Label>
              {availabilityError ? (
                <div className="text-center p-4 bg-red-50 rounded-lg text-red-600">
                  Erreur lors du chargement des créneaux disponibles
                </div>
              ) : availabilityData?.slots?.length === 0 ? (
                <div className="text-center p-4 bg-amber-50 rounded-lg text-amber-700">
                  Aucun créneau disponible pour cette date
                </div>
              ) : !availabilityData ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
                      <div key={hour} className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-amber-500" />
                          {hour}h
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map((timeSlot) => (
                            <Button
                              key={timeSlot}
                              variant={formData.hourAppointment === timeSlot ? "default" : "outline"}
                              className={cn(
                                formData.hourAppointment === timeSlot ? "bg-amber-500 hover:bg-amber-600" : "",
                                "text-sm",
                              )}
                              onClick={() => handleHourAppointmentChange(timeSlot)}
                            >
                              {timeSlot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {formData.hourAppointment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Date:</span>
                  <span>{format(formData.date, "EEEE d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Heure:</span>
                  <span>{formData.hourAppointment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée estimée:</span>
                  <span>{formatDuration(formData.estimatedTime)}</span>
                </div>
              </div>
            )}
          </div>
        )

      case 5: // Paiement
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut du rendez-vous *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem value="INCHAIR">En service</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "CONFIRMED" && (
              <>
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" /> Espèces
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Mobile Money
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.paymentMethod === "mobile" ? (
                  <div className="space-y-2">
                    <Label htmlFor="mobileMoneyNumber">Numéro Mobile Money</Label>
                    <Input
                      id="mobileMoneyNumber"
                      name="mobileMoneyNumber"
                      value={formData.mobileMoneyNumber}
                      onChange={handleInputChange}
                      placeholder="Ex: 077123456"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cashAmount">Montant reçu</Label>
                      <Input
                        id="cashAmount"
                        name="cashAmount"
                        type="number"
                        value={formData.cashAmount || ""}
                        onChange={handleInputChange}
                        placeholder="Montant en FCFA"
                      />
                    </div>

                    {formData.cashAmount > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span>Total à payer:</span>
                          <span className="font-semibold">{calculateTotal()} FCFA</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Montant reçu:</span>
                          <span>{formData.cashAmount} FCFA</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Monnaie à rendre:</span>
                          <span className={formData.changeAmount >= 0 ? "text-green-600" : "text-red-600"}>
                            {formData.changeAmount} FCFA
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span>{formData.firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Téléphone:</span>
                  <span>{formData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{format(formData.date, "dd/MM/yyyy", { locale: fr })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heure:</span>
                  <span>{formData.hourAppointment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coiffeur:</span>
                  <span>
                    {formData.barberId === "unassigned"
                      ? "Non assigné"
                      : barbers?.find((b: any) => b.id === formData.barberId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span>{formData.serviceIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée estimée:</span>
                  <span>{formatDuration(formData.estimatedTime)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{calculateTotal()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Indicateur d'étape
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step
                  ? "bg-amber-500 text-white"
                  : currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500",
              )}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            <div className="text-xs mt-1 text-center">
              {step === 1
                ? "Client"
                : step === 2
                  ? "Services"
                  : step === 3
                    ? "Coiffeur"
                    : step === 4
                      ? "Date"
                      : "Paiement"}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="px-0">
          <SheetTitle>{mode === "create" ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Créez un nouveau rendez-vous en suivant les étapes."
              : "Modifiez les détails du rendez-vous existant."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={currentStep === 1 ? onClose : prevStep} disabled={isLoading}>
              {currentStep === 1 ? (
                "Annuler"
              ) : (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Retour
                </>
              )}
            </Button>

            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={currentStep === 5 ? handleSubmit : nextStep}
              disabled={isLoading || !canProceedToNextStep()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : currentStep === 5 ? (
                mode === "create" ? (
                  "Créer"
                ) : (
                  "Mettre à jour"
                )
              ) : (
                <>
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
