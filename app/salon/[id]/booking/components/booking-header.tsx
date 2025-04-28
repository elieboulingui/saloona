"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { BookingHeaderProps } from "../types/booking"

export function BookingHeader({ step, countdown, appointmentId, onBack, salonId }: BookingHeaderProps) {
  return (
    <header className="bg-amber-500 shadow-md sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          {step === 1 ? (
            <Link href={`/salon/${salonId}`}>
              <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
                <ArrowLeft className="h-5 w-5 text-white" />
              </motion.div>
            </Link>
          ) : (
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          )}
          <div>
            <h1 className="text-white font-bold text-lg">Réservation</h1>
            <p className="text-white/80 text-xs">
              Étape {step} sur 5
              {appointmentId && (
                <span className="ml-2">
                  • {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 w-6 rounded-full ${s === step ? "bg-white" : s < step ? "bg-white/60" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
