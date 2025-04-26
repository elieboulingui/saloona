"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, CreditCard, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { BookingResult, BarberType } from "../../types/booking"

interface ConfirmationStepProps {
  result: BookingResult
  fullName: string
  date: string
  barberId: string | null
  barbers: BarberType[] | undefined
  total: number
  transactionPhone: string
  onTransactionPhoneChange: (phone: string) => void
  onCancel: () => void
  onPay: () => void
  countdown: number
}

export function ConfirmationStep({
  result,
  fullName,
  date,
  barberId,
  barbers,
  total,
  transactionPhone,
  onTransactionPhoneChange,
  onCancel,
  onPay,
  countdown,
}: ConfirmationStepProps) {
  const isPhoneValid = transactionPhone.length >= 8

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "tween", ease: "anticipate", duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-500">Numéro de passage:</span>
            <Badge className="bg-amber-500 text-white px-3 py-1 text-base">DIG-{result.orderNumber}</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Client:</span>
              <span className="font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Heure estimée:</span>
              <span className="font-medium">{result.estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{format(new Date(date), "EEEE d MMMM", { locale: fr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Coiffeur:</span>
              <span className="font-medium">
                {barberId === "unassigned"
                  ? "Non assigné"
                  : barbers?.find((b) => b.id === barberId)?.name || "Non assigné"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total à payer:</span>
              <span className="font-bold text-amber-600">{(total + 600).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Frais de service inclus:</span>
              <span className="text-gray-500">600 FCFA</span>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4">
            <p className="text-sm text-amber-800 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Vous avez {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} pour confirmer votre
              réservation
            </p>
          </div>

          {/* Champ pour le numéro de téléphone Mobile Money */}
          <div className="space-y-2 mt-4">
            <label htmlFor="transactionPhone" className="text-sm font-medium">
              Numéro Mobile Money pour le paiement
            </label>
            <Input
              id="transactionPhone"
              placeholder="Ex: 077123456"
              value={transactionPhone}
              onChange={(e) => onTransactionPhoneChange(e.target.value)}
              className="bg-white"
            />
            <p className="text-xs text-gray-500">Ce numéro recevra une notification pour confirmer le paiement</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={onPay} disabled={!isPhoneValid}>
          <CreditCard className="mr-2 h-4 w-4" />
          Payer maintenant
        </Button>
      </div>
    </motion.div>
  )
}
