"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckIcon, Plus, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

export function WithdrawalDialog() {
  const [withdrawalStep, setWithdrawalStep] = useState(1)
  const [withdrawalCode, setWithdrawalCode] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Handle withdrawal form submission
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate sending verification code
    setWithdrawalStep(2)
    // Generate random 6-digit code
    setWithdrawalCode(Math.floor(100000 + Math.random() * 900000).toString())
  }

  // Handle verification code submission
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate successful verification
    setWithdrawalStep(3)
  }

  // Reset and close dialog
  const handleClose = () => {
    setWithdrawalStep(1)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${withdrawalStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl">
                {withdrawalStep === 1 && "Demande de retrait"}
                {withdrawalStep === 2 && "Vérification du code"}
                {withdrawalStep === 3 && "Retrait confirmé"}
              </DialogTitle>
              <DialogDescription>
                {withdrawalStep === 1 && "Veuillez remplir les informations pour effectuer un retrait"}
                {withdrawalStep === 2 && "Un code de vérification a été envoyé à votre email"}
                {withdrawalStep === 3 && "Votre demande de retrait a été traitée avec succès"}
              </DialogDescription>
            </DialogHeader>

            {withdrawalStep === 1 && (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Numéro Mobile Money</Label>
                  <Input id="mobileNumber" placeholder="+241 XX XX XX XX XX" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input id="amount" type="number" placeholder="10000" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motif du retrait</Label>
                  <Textarea id="reason" placeholder="Précisez le motif du retrait" required />
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </form>
            )}

            {withdrawalStep === 2 && (
              <form onSubmit={handleVerificationSubmit} className="space-y-4 mt-4">
                <div className="bg-amber-50 p-4 rounded-lg text-center mb-4">
                  <p className="text-sm text-amber-800">
                    Un code de vérification a été envoyé à votre adresse email. Veuillez saisir ce code pour confirmer
                    le retrait.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Code de vérification</Label>
                  <Input id="verificationCode" placeholder="Entrez le code à 6 chiffres" required />
                  <p className="text-xs text-muted-foreground mt-1">Pour cette démo, le code est: {withdrawalCode}</p>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => setWithdrawalStep(1)}>
                    Retour
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Vérifier
                  </Button>
                </DialogFooter>
              </form>
            )}

            {withdrawalStep === 3 && (
              <div className="space-y-4 mt-4">
                <div className="flex flex-col items-center justify-center py-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-green-100 p-4 rounded-full mb-4"
                  >
                    <CheckIcon className="h-10 w-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-center">Retrait confirmé !</h3>
                  <p className="text-center text-muted-foreground mt-2">
                    Votre demande de retrait a été traitée avec succès. Le montant sera disponible sur votre compte
                    Mobile Money sous peu.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      setWithdrawalStep(1)
                      setIsOpen(false)
                    }}
                  >
                    Terminer
                  </Button>
                </DialogFooter>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

