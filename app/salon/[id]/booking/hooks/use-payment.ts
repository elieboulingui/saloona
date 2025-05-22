"use client"

import { useState } from "react"
import { CreateInvoice, MakePushUSSD, GetInvoice } from "@/lib/ebiling/ebilling"
import { createTransaction, updateTransactionStatus } from "../action"
import { AppointmentStatus } from "@prisma/client"

export function usePayment(salonId: string) {
  
  const [paymentModalStatus, setPaymentModalStatus] = useState<
    "creating" | "pending" | "checking" | "success" | "failed"
  >("creating")
  const [paymentMessage, setPaymentMessage] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentCheckCount, setPaymentCheckCount] = useState(0)

  const processPayment = async ({
    appointmentId,
    fullName,
    phoneNumber,
    transactionPhone,
    onSuccess,
  }: {
    appointmentId: string | null
    fullName: string
    phoneNumber: string
    transactionPhone: string
    onSuccess: (transactionId: string) => void
  }) => {
    if (!appointmentId) return

    setPaymentModalStatus("creating")
    setPaymentMessage("Initialisation de votre paiement...")
    setShowPaymentModal(true)

    try {
      // 1. Créer une facture
      const invoiceData = {
        amount: 500, // Frais de service
        payer_msisdn: transactionPhone,
        payer_email: "gabinmoundziegou@gmail.com", // Idéalement, vous auriez l'email du client
        short_description: `Réservation salon - ${fullName}`,
        description: `Réservation salon - ${fullName}`,
        external_reference: appointmentId,
      }

      const invoiceResponse = await CreateInvoice(invoiceData)

      if (!invoiceResponse || !invoiceResponse.e_bill.bill_id) {
        setPaymentModalStatus("failed")
        setPaymentMessage("Échec de la création de la facture. Veuillez réessayer.")
        return
      }

      // 2. Enregistrer la transaction dans la base de données
      const transactionData = {
        amount: 500,
        reference: invoiceResponse.e_bill.external_reference,
        shortDescription: `Réservation salon - ${fullName}`,
        payerMsisdn: transactionPhone,
        payerEmail: "gabinmoundziegou@gmail.com",
        type: "APPOINTMENT" as const,
        appointmentId: appointmentId,
        bill_id: invoiceResponse.e_bill.bill_id,
        status: "pending",
        organizationId: salonId,
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
        bill_id: invoiceResponse.e_bill.bill_id,
        payer_msisdn: transactionPhone,
        payment_system_name: "airtelmoney",
      }

      await MakePushUSSD(pushData)

      // 4. Vérifier le statut du paiement toutes les 15 secondes
      let attempts = 0
      const maxAttempts = 6 // 6 tentatives = 90 secondes

      const checkInterval = setInterval(async () => {
        attempts++
        setPaymentCheckCount(attempts)

        const invoiceStatus = await GetInvoice(invoiceResponse.e_bill.bill_id)

        if (invoiceStatus && (invoiceStatus.state === "paid" || invoiceStatus.state === "processed")) {
          clearInterval(checkInterval)

          // Mettre à jour le statut de la transaction et du rendez-vous
          await updateTransactionStatus(
            transactionResponse.data.id,
            invoiceStatus.state,
            appointmentId,
            fullName,
            phoneNumber,
            AppointmentStatus.CONFIRMED,
          )

          setPaymentModalStatus("success")
          setPaymentMessage("Paiement confirmé! Redirection vers votre confirmation...")
          onSuccess(transactionResponse.data.id)
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

  return {
    paymentModalStatus,
    paymentMessage,
    showPaymentModal,
    paymentCheckCount,
    setShowPaymentModal,
    processPayment,
  }
}
