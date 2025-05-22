"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AppointmentStatus } from "@prisma/client"
import { useCartStore } from "@/store/cart-service-store"
import { useBookingStore } from "@/store/bookingStore"
import { deleteAppointment, saveAppointment } from "../action"
import { AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { BookingHeader } from "./booking-header"
import { ServicesStep } from "./steps/services-step"
import { UserInfoStep } from "./steps/user-info-step"
import { BarberStep } from "./steps/barber-step"
import { DateStep } from "./steps/date-step"
import { ConfirmationStep } from "./steps/confirmation-step"
import { ErrorStep } from "./steps/error-step"
import { AlertModal } from "./alert-modal"
import { PaymentModal } from "./payment-modal"
import { useCountdown } from "../hooks/use-countdown"
import { usePayment } from "../hooks/use-payment"
import type { BookingResult, BookingStep } from "../types/booking"

interface BookingContentProps {
  id: string
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingPageClient({ id }: BookingContentProps) {
  const router = useRouter()
  const { items, total, totalDuration, clearCart } = useCartStore()
  const { step, setStep, fullName, phoneNumber, barberId, setBarberId } = useBookingStore()

  // États locaux
  const [date, setDate] = useState<string>("")
  const [hourAppointment, setHourAppointment] = useState<string>("")
  const [result, setResult] = useState<BookingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [transactionPhone, setTransactionPhone] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Hooks personnalisés
  const { countdown, startCountdown, stopCountdown } = useCountdown(300)
  const {
    paymentModalStatus,
    paymentMessage,
    showPaymentModal,
    paymentCheckCount,
    setShowPaymentModal,
    processPayment,
  } = usePayment(id)

  // Récupérer les coiffeurs
  const { data: barbers } = useSWR(`/api/organizations/${id}/users?role=BARBER`, fetcher)

  // Fonctions de navigation
  const goToStep = (newStep: BookingStep) => {
    setStep(newStep)
  }

  const handleBack = () => {
    if (step > 1) {
      goToStep((step - 1) as BookingStep)
    }
  }

  // Gestion des formulaires
  const handleNameChange = (name: string) => {
    useBookingStore.setState({ fullName: name })
  }

  const handlePhoneChange = (phone: string) => {
    useBookingStore.setState({ phoneNumber: phone })
  }

  const handleBarberSelect = (id: string | null) => {
    setBarberId(id)
  }

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
  }

  // Gestion des rendez-vous
  // Mettre à jour la fonction handleTimeSlotSelect pour déclencher handleSaveAppointment
  const handleTimeSlotSelect = (timeSlot: string) => {
    setHourAppointment(timeSlot)
    handleSaveAppointment(timeSlot)
  }

  // Modifier handleSaveAppointment pour accepter le paramètre hourAppointment et calculer estimatedTime
  const handleSaveAppointment = async (selectedHourAppointment?: string) => {
    const hourToUse = selectedHourAppointment || hourAppointment
    if (!date || !hourToUse) return

    setLoading(true)
    const serviceIds = items.map((i) => i.serviceId)

    // Calculer le temps estimé en fonction des services sélectionnés
    const estimatedTime = totalDuration()

    const response = await saveAppointment(
      serviceIds,
      new Date(date),
      id,
      fullName,
      phoneNumber,
      AppointmentStatus.PENDING,
      barberId,
      hourToUse,
      estimatedTime,
    )

    setResult(response)
    
    setLoading(false)

    if (response.success) {
      goToStep(5)
      if (response.appointmentId) {
        handleAppointmentSuccess(response.appointmentId)
      }
    }
  }

  const handleAppointmentSuccess = (id: string) => {
    setAppointmentId(id)
    setTransactionPhone(phoneNumber) // Initialiser avec le même numéro que celui saisi précédemment
    startCountdown(handleAutoCancel)
  }

  const handleAutoCancel = async () => {
    if (appointmentId) {
      await deleteAppointment(appointmentId)
      setAppointmentId(null)
      goToStep(1)
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
      goToStep(1)
      clearCart()
    }
  }

  const handlePaymentSuccess = (transactionId: string) => {
    stopCountdown()

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push(`/salon/${id}/booking/confirmation/${transactionId}`)
    }, 2000)
  }

  const handlePaymentProcess = () => {
    processPayment({
      appointmentId,
      fullName,
      phoneNumber,
      transactionPhone,
      onSuccess: handlePaymentSuccess,
    })
  }

  // Nettoyage
  useEffect(() => {
    return () => {
      stopCountdown()
    }
  }, [])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      <BookingHeader step={step} countdown={countdown} appointmentId={appointmentId} onBack={handleBack} salonId={id} />

      <main className="flex-1 p-4 container mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <ServicesStep
              items={items}
              total={total}
              totalDuration={totalDuration}
              onNext={() => goToStep(2)}
              salonId={id}
            />
          )}

          {step === 2 && (
            <UserInfoStep
              fullName={fullName}
              phoneNumber={phoneNumber}
              onNameChange={handleNameChange}
              onPhoneChange={handlePhoneChange}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {step === 3 && (
            <BarberStep
              salonId={id}
              barberId={barberId}
              onBarberSelect={handleBarberSelect}
              onNext={() => goToStep(4)}
              onBack={() => goToStep(2)}
              items={items}
            />
          )}

          {step === 4 && (
            <DateStep
              salonId={id}
              barberId={barberId}
              date={date}
              onDateChange={handleDateChange}
              onNext={handleTimeSlotSelect}
              onBack={() => goToStep(3)}
              isLoading={loading}
            />
          )}

          {step === 5 && result?.success && (
            <ConfirmationStep
              result={result}
              fullName={fullName}
              date={date}
              barberId={barberId}
              barbers={barbers}
              total={total()}
              transactionPhone={transactionPhone}
              onTransactionPhoneChange={setTransactionPhone}
              onCancel={() => setShowCancelModal(true)}
              onPay={handlePaymentProcess}
              countdown={countdown}
            />
          )}

          {step === 5 && !result?.success && <ErrorStep error={result?.error || ""} onRetry={() => goToStep(1)} />}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelAppointment}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler votre réservation ? Cette action est irréversible."
      />

      {showPaymentModal && (
        <PaymentModal
          status={paymentModalStatus}
          message={paymentMessage}
          onClose={() => setShowPaymentModal(false)}
          onRetry={handlePaymentProcess}
          checkCount={paymentCheckCount}
        />
      )}
    </div>
  )
}
