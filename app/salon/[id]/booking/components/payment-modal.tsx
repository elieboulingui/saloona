"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle, SmartphoneIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentStatus = "creating" | "pending" | "checking" | "success" | "failed"

interface PaymentModalProps {
  status: PaymentStatus
  message: string
  onClose: () => void
  onRetry?: () => void
  checkCount: number
}

export function PaymentModal({ status, message, onClose, onRetry, checkCount }: PaymentModalProps) {
  // Empêcher le défilement du corps lorsque le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-xl"
      >
        <div className="text-center">
          {status === "creating" || status === "pending" || status === "checking" ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4"
            >
              {status === "pending" ? (
                <SmartphoneIcon className="h-10 w-10 text-amber-500" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                >
                  <Loader2 className="h-10 w-10 text-amber-500" />
                </motion.div>
              )}
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <XCircle className="h-10 w-10 text-red-500" />
            </motion.div>
          )}

          <h3 className="text-lg font-bold mb-2">
            {status === "creating"
              ? "Initialisation du paiement"
              : status === "pending" || status === "checking"
                ? "Paiement en cours"
                : status === "success"
                  ? "Paiement réussi"
                  : "Échec du paiement"}
          </h3>

          <p className="text-gray-600 mb-6">{message}</p>

          {status === "pending" && (
            <>
              <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(checkCount / 4) * 100}%` }}
                  className="bg-amber-500 h-2.5 rounded-full"
                />
                <p className="text-xs text-gray-500 mt-1">Vérification {checkCount}/4</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4 text-left">
                <p className="text-sm text-amber-800 font-medium mb-1">Instructions:</p>
                <ol className="text-xs text-amber-700 list-decimal pl-4 space-y-1">
                  <li>Vérifiez votre téléphone pour une notification Mobile Money</li>
                  <li>Confirmez le paiement en saisissant votre code PIN</li>
                  <li>Ne quittez pas cette page pendant la vérification</li>
                  <li>Le processus peut prendre jusqu'à 60 secondes</li>
                </ol>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-center">
            {status === "failed" && onRetry && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button onClick={onRetry} className="bg-amber-500 hover:bg-amber-600 rounded-full">
                  Réessayer
                </Button>
              </motion.div>
            )}

            {(status === "success" || status === "failed") && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onClose}
                  variant={status === "success" ? "default" : "outline"}
                  className={`rounded-full ${status === "success" ? "bg-green-500 hover:bg-green-600" : ""}`}
                >
                  {status === "success" ? "Voir le reçu de paiement" : "Fermer"}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
