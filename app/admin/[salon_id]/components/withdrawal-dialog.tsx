"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface WithdrawalDialogProps {
  salonId: string
  onSuccess?: () => void
}

export function WithdrawalDialog({ salonId, onSuccess }: WithdrawalDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !phoneNumber) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    const amountValue = Number.parseInt(amount.replace(/\D/g, ""))
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Montant invalide")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/organizations/${salonId}/withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
          phoneNumber,
          salonId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      toast.success("Demande de retrait envoyée avec succès")
      setIsOpen(false)
      setAmount("")
      setPhoneNumber("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  // Formater le montant avec des espaces
  const formatAmount = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatAmount(value))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="fixed bottom-20 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button size="lg" className="rounded-full h-14 w-14 bg-amber-500 hover:bg-amber-600 shadow-lg">
            <Wallet className="h-6 w-6" />
            <span className="sr-only">Effectuer un retrait</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Effectuer un retrait</DialogTitle>
          <DialogDescription>Entrez le montant et le numéro de téléphone pour effectuer un retrait.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pr-16"
                  placeholder="10 000"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-gray-500">
                  FCFA
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="col-span-3"
                placeholder="0123456789"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer le retrait"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
