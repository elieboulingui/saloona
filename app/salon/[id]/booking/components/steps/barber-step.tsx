"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BarberType, ServiceCartItem } from "../../types/booking"
import { StepNavigation } from "../step-navigation"
import useSWR from "swr"

interface BarberStepProps {
  salonId: string
  barberId: string | null
  onBarberSelect: (id: string | null) => void
  onNext: () => void
  onBack: () => void
  items: ServiceCartItem[]
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function BarberStep({ salonId, barberId, onBarberSelect, onNext, onBack, items }: BarberStepProps) {
  const { data: barbers, error: barbersError } = useSWR(`/api/organizations/${salonId}/users`, fetcher)

  // Filtrer les coiffeurs en fonction des services sélectionnés
  const filteredBarbers =
    barbers?.filter((barber: BarberType) => {
      // Si aucun service n'est sélectionné, afficher tous les coiffeurs
      if (items.length === 0) return true

      // Vérifier si le coiffeur est assigné à au moins un des services sélectionnés
      return items.some((item) => {
        const service = item.serviceId
        return barber.services?.some((s: any) => s.serviceId === service)
      })
    }) || []


    console.log("Service selected: ", items)
    console.log("Barbers: ", barbers)

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
          <Scissors className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">Choisissez un professionnel</h2>
        <p className="text-gray-500 text-sm mt-1">Sélectionnez le coiffeur qui s'occupera de vous</p>
      </div>

      {barbersError ? (
        <div className="text-center p-4 bg-red-50 rounded-lg text-red-600">
          Erreur lors du chargement des professionnels
        </div>
      ) : !barbers ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
          <Card
            key="unassigned"
            className={cn(
              "cursor-pointer transition-all py-0",
              barberId === "unassigned" ? "border-amber-500 bg-amber-50" : "hover:border-gray-300",
            )}
            onClick={() => onBarberSelect("unassigned")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gray-200 text-gray-600">NA</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Non assigné</div>
                <div className="text-sm text-muted-foreground">N'importe quel coiffeur disponible</div>
              </div>
              {barberId === "unassigned" && <Check className="ml-auto h-5 w-5 text-amber-500" />}
            </CardContent>
          </Card>

          {filteredBarbers.map((barber: BarberType) => (
            <Card
              key={barber.id}
              className={cn(
                "cursor-pointer transition-all py-0",
                barberId === barber.id ? "border-amber-500 bg-amber-50" : "hover:border-gray-300",
              )}
              onClick={() => onBarberSelect(barber.id)}
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
                {barberId === barber.id && <Check className="ml-auto h-5 w-5 text-amber-500" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StepNavigation onBack={onBack} onNext={onNext} canProceed={barberId !== null} />
    </motion.div>
  )
}
