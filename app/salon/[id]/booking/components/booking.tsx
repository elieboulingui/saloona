"use client"

import { useRouter } from "next/navigation"

import { useEffect, useRef, useState } from "react"
import { AppointmentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-service-store"
import { deleteAppointment, saveAppointment } from "../action"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  ShoppingBag,
  User,
  X,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertModal } from "./alert-modal"
import { PaymentModal } from "./payment-modal"

// Ajouter ces imports pour les fonctions d'ebilling
import { CreateInvoice, MakePushUSSD, GetInvoice } from "@/lib/ebiling/ebilling"
import { createTransaction, updateTransactionStatus } from "../action"
import { generateRandomCode } from "@/utils/generateRandomCode"

interface BookingContentProps {
  id: string
}

export default function BookingPageClient({ id }: BookingContentProps) {
  const { items, total, totalDuration, clearCart } = useCartStore()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [countdown, setCountdown] = useState(300) // 5 minutes
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  // Modifier l'état pour ajouter le numéro de téléphone pour la transaction
  const [transactionPhone, setTransactionPhone] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | null>(null)

  // Nouveaux états pour l'interface améliorée
  const [showCancelModal, setShowCancelModal] = useState(false)
  // Modifier l'initialisation de l'état showPaymentModal pour qu'il soit false par défaut
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentCheckCount, setPaymentCheckCount] = useState(0)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentModalStatus, setPaymentModalStatus] = useState<
    "creating" | "pending" | "checking" | "success" | "failed"
  >("creating")

  const router = useRouter()

  // Validation des formulaires
  const isNameValid = fullName.trim().length >= 3
  const isPhoneValid = /^[0-9]{8,9}$/.test(phone.trim())
  const isDateValid = date !== ""

  const canProceedToStep2 = items.length > 0
  const canProceedToStep3 = isNameValid && isPhoneValid
  const canProceedToStep4 = isDateValid

  const handleSaveAppointment = async () => {
    if (!date) return
    setLoading(true)
    const serviceIds = items.map((i) => i.serviceId)
    const response = await saveAppointment(serviceIds, new Date(date), id, fullName, phone, AppointmentStatus.PENDING)
    setResult(response)
    setLoading(false)

    if (response.success) {
      setStep(4)
      if (response.appointmentId) {
        handleAppointmentSuccess(response.appointmentId)
      }
    }
  }

  const handleAppointmentSuccess = (id: string) => {
    setAppointmentId(id)
    // Modifier la fonction handleAppointmentSuccess pour initialiser le numéro de transaction
    setTransactionPhone(phone) // Initialiser avec le même numéro que celui saisi précédemment
    setStep(4)
    setCountdown(300) // 5 min

    // Lance le timer
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          handleAutoCancel() // Timeout = annuler automatiquement
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAutoCancel = async () => {
    if (appointmentId) {
      await deleteAppointment(appointmentId)
      setAppointmentId(null)
      setStep(1)
      alert("Réservation expirée (5 min écoulées)")
    }
  }

  const handleCancelAppointment = async () => {
    if (appointmentId) {
      setShowCancelModal(false)
      setLoading(true)
      await deleteAppointment(appointmentId)
      setLoading(false)
      setAppointmentId(null)
      setStep(1)
      clearCart()
    }
  }

  // Modifier la fonction handlePaymentSuccess pour accepter l'ID de transaction
  const handlePaymentSuccess = (transactionId: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(0)
    setPaymentStatus("success")
    setPaymentModalStatus("success")
    setPaymentMessage("Votre paiement a été traité avec succès!")

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push(`/salon/${id}/booking/confirmation/${transactionId}`)
    }, 2000)
  }

  // Remplacer la fonction simulatePaymentProcess par cette implémentation réelle
  // Modifier la fonction processPayment pour s'assurer que le modal s'affiche uniquement après l'initialisation
  // Remplacer la fonction simulatePaymentProcess par cette implémentation réelle
  const processPayment = async () => {

    setPaymentModalStatus("creating")
    setPaymentMessage("Initialisation de votre paiement...")
    setShowPaymentModal(true)

    try {

      // 1. Créer une facture
      const invoiceData = {
        amount: 500, // Ajouter les frais de service
        payer_msisdn: transactionPhone,
        payer_email: "gabinmoundziegou@gmail.com", // Idéalement, vous auriez l'email du client
        short_description: `Réservation salon - ${fullName}`,
        external_reference: generateRandomCode(),
      }

      const invoiceResponse = await CreateInvoice(invoiceData)

      if (!invoiceResponse || !invoiceResponse.bill_id) {
        setPaymentModalStatus("failed")
        setPaymentMessage("Échec de la création de la facture. Veuillez réessayer.")
        return
      }

     if(!appointmentId){
      return 
     }

      // 2. Enregistrer la transaction dans la base de données
      const transactionData = {
        amount: 500,
        reference: invoiceResponse.external_reference,
        shortDescription: `Réservation salon - ${fullName}`,
        payerMsisdn: transactionPhone,
        payerEmail: "gabinmoundziegou@gmail.com",
        type: "APPOINTMENT" as const, // Explicitly set type to "APPOINTMENT"
        appointmentId: appointmentId,
        bill_id: invoiceResponse.bill_id,
        status: "pending",
        organizationId: id,
      }

      const transactionResponse = await createTransaction(transactionData)

      if (!transactionResponse.success) {
        setPaymentModalStatus("failed")
        setPaymentMessage("Échec de l'enregistrement de la transaction. Veuillez réessayer.")
        return
      }

      // 3. Initialiser le push USSD
      setPaymentModalStatus("pending")
      setPaymentMessage(
        "Veuillez confirmer le paiement sur votre téléphone. Un message USSD va s'afficher sur votre appareil.",
      )

      const pushData = {
        bill_id: invoiceResponse.bill_id,
        payer_msisdn: transactionPhone,
      }

      await MakePushUSSD(pushData)

      // 4. Vérifier le statut du paiement toutes les 15 secondes
      let attempts = 0
      const maxAttempts = 4 // 4 tentatives = 60 secondes

      const checkInterval = setInterval(async () => {
        attempts++
        setPaymentCheckCount(attempts)

        const invoiceStatus = await GetInvoice(invoiceResponse.bill_id)

        if (invoiceStatus && (invoiceStatus.status === "paid" || invoiceStatus.status === "processed")) {
          clearInterval(checkInterval)

          // Mettre à jour le statut de la transaction et du rendez-vous
          await updateTransactionStatus(
            transactionResponse.data.id,
            invoiceStatus.status,
            appointmentId!,
            fullName,
            phone,
            AppointmentStatus.CONFIRMED,
          )

          setPaymentModalStatus("success")
          setPaymentMessage("Paiement confirmé! Redirection vers votre confirmation...")
          handlePaymentSuccess(transactionResponse.data.id)

        } else if (attempts >= maxAttempts) {

          clearInterval(checkInterval)
          setPaymentModalStatus("failed")
          setPaymentMessage("Le délai de paiement a expiré. Veuillez réessayer ou vérifier votre solde Mobile Money.")
          
        }
      }, 15000) // Vérifier toutes les 15 secondes

      return () => clearInterval(checkInterval)
    } catch (error) {
      console.error("Erreur lors du processus de paiement:", error)
      setPaymentModalStatus("failed")
      setPaymentMessage("Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.")
    }
  }


  // Formater la durée en heures et minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3,
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/salon/${id}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">Réservation</h1>
            <p className="text-white/80 text-xs">
              Étape {step} sur 4
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
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 w-6 rounded-full ${s === step ? "bg-white" : s < step ? "bg-white/60" : "bg-white/30"}`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
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
                  <Button variant="outline" className="mx-auto" onClick={() => router.push(`/salon/${id}`)}>
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
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                  >
                    Continuer
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`bg-white ${!isPhoneValid && phone ? "border-red-300" : ""}`}
                  />
                  {!isPhoneValid && phone && (
                    <p className="text-red-500 text-xs">Entrez un numéro de téléphone valide (8-9 chiffres)</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
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
                    onChange={(e) => setDate(e.target.value)}
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
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={handleSaveAppointment}
                  disabled={loading || !canProceedToStep4}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Valider
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && result?.success && (
            <motion.div
              key="step4"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Réservation confirmée</h2>
                <p className="text-gray-500 text-sm mt-1">Votre rendez-vous a été enregistré avec succès</p>
              </div>

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
                      <span className="text-gray-500">Total à payer:</span>
                      <span className="font-bold text-amber-600">{(total() + 600).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Frais de service inclus:</span>
                      <span className="text-gray-500">600 FCFA</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4">
                    <p className="text-sm text-amber-800 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Vous avez {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} pour
                      confirmer votre réservation
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
                      onChange={(e) => setTransactionPhone(e.target.value)}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500">
                      Ce numéro recevra une notification pour confirmer le paiement
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={() => processPayment()}
                  disabled={!transactionPhone || transactionPhone.length < 8}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payer maintenant
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && !result?.success && (
            <motion.div
              key="step4-error"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-6 text-center"
            >
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold">Une erreur est survenue</h2>
              <p className="text-gray-500">{result?.error || "Impossible de créer votre réservation"}</p>
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setStep(1)}>
                Réessayer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de confirmation d'annulation */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelAppointment}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler votre réservation ? Cette action est irréversible."
      />

      {/* Modal de paiement */}
      {showPaymentModal && (
        <PaymentModal
          status={paymentModalStatus}
          message={paymentMessage}
          onClose={() => setShowPaymentModal(false)}
          onRetry={() => processPayment()}
          checkCount={paymentCheckCount}
        />
      )}
    </div>
  )
}
