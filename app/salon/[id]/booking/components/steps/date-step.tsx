"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Loader2 } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { StepNavigation } from "../step-navigation"

interface DateStepProps {
  salonId: string
  barberId: string | null
  date: string
  onDateChange: (date: string) => void
  onNext: (hourAppointment: string) => void
  onBack: () => void
  isLoading: boolean
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DateStep({ salonId, barberId, date, onDateChange, onNext, onBack, isLoading }: DateStepProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  // Récupérer les créneaux disponibles en fonction de la date et du coiffeur sélectionnés
  const { data: availabilityData, error: availabilityError } = useSWR(
    date && barberId && salonId
      ? `/api/organizations/${salonId}/availability/slots?date=${date}&barberId=${barberId}`
      : null,
    fetcher,
  )

  // Validation
  const isDateValid = date !== ""
  const isTimeSlotSelected = selectedTimeSlot !== null
  const canProceed = isDateValid && isTimeSlotSelected

  // Grouper les créneaux horaires par heure pour une meilleure organisation
  const availableTimeSlots = availabilityData?.slots || []
  // Correction du typage pour éviter l'erreur
  const groupedTimeSlots = availableTimeSlots.reduce(
    (acc: Record<string, string[]>, slot: string) => {
      if (typeof slot === "string") {
        const hour = slot.split(":")[0]
        if (!acc[hour]) {
          acc[hour] = []
        }
        acc[hour].push(slot)
      }
      return acc
    },
    {} as Record<string, string[]>,
  )
  const handleSubmit = () => {
    if (selectedTimeSlot) {
      console.log("Selected time slot:", selectedTimeSlot)
      onNext(selectedTimeSlot)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "tween", ease: "anticipate", duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">Choisissez une date</h2>
        <p className="text-gray-500 text-sm mt-1">Sélectionnez la date de votre rendez-vous</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date du rendez-vous
          </label>
          <Input
            id="date"
            type="date"
            value={date}
            autoFocus={true}
            onChange={(e) => onDateChange(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
            className="bg-white"
          />
        </div>

        {date && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-800">
              Vous avez choisi le{" "}
              <span className="font-medium">{format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })}</span>
            </p>
          </div>
        )}

        {date && (
          <div className="space-y-4 mt-4">
            <label className="text-sm font-medium">Heure du rendez-vous</label>

            {availabilityError ? (
              <div className="text-center p-4 bg-red-50 rounded-lg text-red-600">
                Erreur lors du chargement des créneaux disponibles
              </div>
            ) : availableTimeSlots.length === 0 && availabilityData ? (
              <div className="text-center p-4 bg-amber-50 rounded-lg text-amber-700">
                Aucun créneau disponible pour cette date
              </div>
            ) : !availabilityData ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
                  <div key={hour} className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-amber-500" />
                      {hour}h
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.isArray(slots) &&
                        slots.map((timeSlot) => (
                          <Button
                            key={timeSlot}
                            variant={selectedTimeSlot === timeSlot ? "default" : "outline"}
                            className={cn(
                              selectedTimeSlot === timeSlot ? "bg-amber-500 hover:bg-amber-600" : "",
                              "text-sm",
                            )}
                            onClick={() => setSelectedTimeSlot(timeSlot)}
                          >
                            {timeSlot}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <StepNavigation
        onBack={onBack}
        onNext={handleSubmit}
        canProceed={canProceed}
        isLoading={isLoading}
        nextLabel="Valider"
      />
    </motion.div>
  )
}
