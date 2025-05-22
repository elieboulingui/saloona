"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { User } from "lucide-react"
import { StepNavigation } from "../step-navigation"

interface UserInfoStepProps {
  fullName: string
  phoneNumber: string
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
  onNext: () => void
  onBack: () => void
}

export function UserInfoStep({
  fullName,
  phoneNumber,
  onNameChange,
  onPhoneChange,
  onNext,
  onBack,
}: UserInfoStepProps) {
  const isNameValid = fullName.trim().length >= 3
  const isPhoneValid = /^[0-9]{8,9}$/.test(phoneNumber.trim())
  const canProceed = isNameValid && isPhoneValid

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
          <User className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">Vos informations</h2>
        <p className="text-gray-500 text-sm mt-1">Entrez vos coordonnées pour la réservation</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Nom complet
          </label>
          <Input
            id="fullName"
            placeholder="Entrez votre nom complet"
            autoFocus={true}
            value={fullName}
            onChange={(e) => onNameChange(e.target.value)}
            className={`bg-white ${!isNameValid && fullName ? "border-red-300" : ""}`}
          />
          {!isNameValid && fullName && (
            <p className="text-red-500 text-xs">Le nom doit contenir au moins 3 caractères</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Numéro Mobile Money
          </label>
          <Input
            id="phone"
            placeholder="Ex: 077123456"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`bg-white ${!isPhoneValid && phoneNumber ? "border-red-300" : ""}`}
          />
          {!isPhoneValid && phoneNumber && (
            <p className="text-red-500 text-xs">Entrez un numéro de téléphone valide (8-9 chiffres)</p>
          )}
        </div>
      </div>

      <StepNavigation onBack={onBack} onNext={onNext} canProceed={canProceed} />
    </motion.div>
  )
}
