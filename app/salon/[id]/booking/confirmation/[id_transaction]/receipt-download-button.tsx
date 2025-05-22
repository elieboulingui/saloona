"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from 'lucide-react'
import { jsPDF } from "jspdf"
import QRCode from "qrcode"

interface ReceiptDownloadButtonProps {
  transaction: any
  appointment: any
  services: any[] // Changer pour accepter un tableau de services
  salonId: string
}

export function ReceiptDownloadButton({ transaction, appointment, services, salonId }: ReceiptDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Créer un nouveau document PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Ajouter le logo et l'en-tête
      doc.setFontSize(22)
      doc.setTextColor(245, 158, 11) // Couleur ambre
      doc.text("Saloona", 105, 20, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Application de reservation en ligne", 105, 28, { align: "center" })
      doc.text("Libreville, Centre ville", 105, 34, { align: "center" })
      doc.text("Tel: +241 77 80 88 64", 105, 40, { align: "center" })

      // Ligne de séparation
      doc.setDrawColor(245, 158, 11)
      doc.line(20, 45, 190, 45)

      // Titre du reçu
      doc.setFontSize(18)
      doc.setTextColor(245, 158, 11)
      doc.text("REÇU DE PAIEMENT", 105, 55, { align: "center" })

      // Informations de la transaction
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Colonne de gauche
      let y = 70
      doc.text("Référence:", 20, y)
      doc.text(transaction.reference, 70, y)

      y += 8
      doc.text("Transaction ID:", 20, y)
      doc.text(transaction.id, 70, y)

      y += 8
      doc.text("Date:", 20, y)
      doc.text(new Date(transaction.createdAt).toLocaleDateString("fr-FR"), 70, y)

      y += 8
      doc.text("Montant payé:", 20, y)
      doc.text(`${(transaction.amount+600)} FCFA`, 70, y)

      y += 8
      doc.text("Méthode:", 20, y)
      doc.text("Mobile Money", 70, y)

      y += 8
      doc.text("Statut:", 20, y)

      // Définir la couleur du statut
      const isSuccess = transaction.status === "processed" || transaction.status === "paid"
      const isPending = transaction.status === "ready"
      const statusText = isSuccess ? "Succès" : isPending ? "En attente" : "Échoué"

      if (isSuccess)
        doc.setTextColor(0, 128, 0) // Vert
      else if (isPending)
        doc.setTextColor(255, 165, 0) // Orange
      else doc.setTextColor(255, 0, 0) // Rouge

      doc.text(statusText, 70, y)
      doc.setTextColor(0, 0, 0) // Réinitialiser la couleur

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y + 10, 190, y + 10)

      // Détails du rendez-vous
      y += 20
      doc.setFontSize(16)
      doc.setTextColor(245, 158, 11)
      doc.text("DÉTAILS DU RENDEZ-VOUS", 105, y, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      y += 10
      doc.text("Ordre de passage:", 20, y)
      doc.text(`DIG-${appointment.orderNumber}`, 70, y)

      y += 8
      doc.text("Nom:", 20, y)
      doc.text(`${appointment.firstName}`, 70, y)

      y += 8
      doc.text("Heure estimée:", 20, y)
      doc.text(appointment.estimatedTime, 70, y)

      // Afficher tous les services
      y += 8
      doc.text("Services:", 20, y)
      if (services && services.length > 0) {
        let serviceText = "";
        services.forEach((service, index) => {
          serviceText += service.name;
          if (index < services.length - 1) {
            serviceText += ", ";
          }
        });
        doc.text(serviceText, 70, y);
        
        // Si la liste est trop longue, ajouter une nouvelle ligne pour les prix
        y += 8;
        doc.text("Prix des services:", 20, y);
        let priceText = "";
        services.forEach((service, index) => {
          priceText += `${service.price} FCFA`;
          if (index < services.length - 1) {
            priceText += ", ";
          }
        });
        doc.text(priceText, 70, y);
      } else {
        doc.text("Aucun service spécifié", 70, y);
      }

      y += 8
      doc.text("Date:", 20, y)
      const formattedDate = new Date(appointment.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      doc.text(formattedDate, 70, y)

      // Générer le QR code avec l'URL de confirmation
      const baseUrl = "https://saloona.online"


      const confirmationUrl = `${baseUrl}/salon/${salonId}/booking/confirmation/${transaction.id}`

      const qrCodeDataUrl = await QRCode.toDataURL(confirmationUrl, {
        width: 150,
        margin: 1,
      })

      // Ajouter le QR code
      doc.addImage(qrCodeDataUrl, "PNG", 130, 120, 40, 40)

      // Ajouter une légende pour le QR code
      doc.setFontSize(10)
      doc.text("Scannez ce QR code pour accéder", 150, 170, { align: "center" })
      doc.text("à votre confirmation en ligne", 150, 175, { align: "center" })

      // Pied de page
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Merci de votre confiance !", 105, 270, { align: "center" })
      doc.text("www.sadji.vercel.app", 105, 275, { align: "center" })

      // Télécharger le PDF
      doc.save(`recu-${transaction.reference}.pdf`)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full mb-4 border-amber-500 text-amber-500 hover:bg-amber-50 flex items-center justify-center"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Télécharger le reçu
        </>
      )}
    </Button>
  )
}
