"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ErrorStepProps {
  error: string
  onRetry: () => void
}

export function ErrorStep({ error, onRetry }: ErrorStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "tween", ease: "anticipate", duration: 0.3 }}
      className="space-y-6 text-center"
    >
      <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <X className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold">Une erreur est survenue</h2>
      <p className="text-gray-500">{error || "Impossible de créer votre réservation"}</p>
      <Button className="bg-amber-500 hover:bg-amber-600" onClick={onRetry}>
        Réessayer
      </Button>
    </motion.div>
  )
}
