"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ShoppingBag } from "lucide-react"
import type { ServiceCartItem } from "../../types/booking"

interface ServicesStepProps {
  items: ServiceCartItem[]
  total: () => number
  totalDuration: () => number
  onNext: () => void
  salonId: string
}

export function ServicesStep({ items, total, totalDuration, onNext, salonId }: ServicesStepProps) {
  const router = useRouter()

  // Formater la durée en heures et minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
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
          <ShoppingBag className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">Récapitulatif des services</h2>
        <p className="text-gray-500 text-sm mt-1">Vérifiez les services que vous avez sélectionnés</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm p-6">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Button variant="outline" className="mx-auto" onClick={() => router.push(`/salon/${salonId}`)}>
            Parcourir les services
          </Button>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.serviceId} className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.serviceName}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{item.duration} min</span>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600">{item.price.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-amber-600">{total().toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durée totale:</span>
              <span className="font-medium">{formatDuration(totalDuration())}</span>
            </div>
          </div>

          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 mt-4"
            onClick={onNext}
            disabled={items.length === 0}
          >
            Continuer
          </Button>
        </>
      )}
    </motion.div>
  )
}
