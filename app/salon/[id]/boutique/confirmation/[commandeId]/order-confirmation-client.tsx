"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Package, Truck, Home, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { jsPDF } from "jspdf"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface OrderConfirmationClientProps {
  order: any // Utiliser any pour simplifier, mais idéalement nous devrions définir un type précis
  organizationId: string
}

export function OrderConfirmationClient({ order, organizationId }: OrderConfirmationClientProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Simuler une date de livraison estimée (date de commande + 2 jours)
  const deliveryDate = new Date(order.createdAt)
  deliveryDate.setDate(deliveryDate.getDate() + 2)
  const formattedDeliveryDate = format(deliveryDate, "EEEE d MMMM", { locale: fr })

  // Animation pour les étapes de livraison
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Fonction pour générer et télécharger le PDF
  const handleDownloadPDF = async () => {
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
      doc.text(order.organization.name.toUpperCase(), 105, 20, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Boutique en ligne", 105, 28, { align: "center" })
      doc.text(order.organization.address, 105, 34, { align: "center" })
      if (order.organization.phone) {
        doc.text(`Tel: ${order.organization.phone}`, 105, 40, { align: "center" })
      }

      // Ligne de séparation
      doc.setDrawColor(245, 158, 11)
      doc.line(20, 45, 190, 45)

      // Titre du reçu
      doc.setFontSize(18)
      doc.setTextColor(245, 158, 11)
      doc.text("FACTURE DE COMMANDE", 105, 55, { align: "center" })

      // Informations de la commande
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Colonne de gauche
      let y = 70
      doc.text("Numéro de commande:", 20, y)
      doc.text(order.id, 80, y)

      y += 8
      doc.text("Date:", 20, y)
      doc.text(format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"), 80, y)

      y += 8
      doc.text("Client:", 20, y)
      doc.text(order.firstName, 80, y)

      y += 8
      doc.text("Téléphone:", 20, y)
      doc.text(order.phoneNumber, 80, y)

      y += 8
      doc.text("Adresse de livraison:", 20, y)
      doc.text(order.address, 80, y)

      if (order.additionalInfo) {
        y += 8
        doc.text("Informations:", 20, y)
        doc.text(order.additionalInfo, 80, y)
      }

      y += 8
      doc.text("Statut:", 20, y)

      // Définir la couleur du statut
      let statusText = ""
      switch (order.status) {
        case "PENDING":
          statusText = "En attente"
          doc.setTextColor(255, 165, 0) // Orange
          break
        case "CONFIRMED":
          statusText = "Confirmée"
          doc.setTextColor(0, 128, 0) // Vert
          break
        case "SHIPPED":
          statusText = "Expédiée"
          doc.setTextColor(0, 0, 255) // Bleu
          break
        case "COMPLETED":
          statusText = "Livrée"
          doc.setTextColor(0, 128, 0) // Vert
          break
        case "CANCELED":
          statusText = "Annulée"
          doc.setTextColor(255, 0, 0) // Rouge
          break
        default:
          statusText = order.status
          doc.setTextColor(0, 0, 0) // Noir
      }

      doc.text(statusText, 80, y)
      doc.setTextColor(0, 0, 0) // Réinitialiser la couleur

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y + 10, 190, y + 10)

      // Détails des articles
      y += 20
      doc.setFontSize(16)
      doc.setTextColor(245, 158, 11)
      doc.text("DÉTAILS DES ARTICLES", 105, y, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      y += 10
      // En-têtes du tableau
      doc.setFont("helvetica", "bold")
      doc.text("Article", 20, y)
      doc.text("Qté", 120, y)
      doc.text("Prix unitaire", 140, y)
      doc.text("Total", 170, y)
      doc.setFont("helvetica", "normal")

      y += 5
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y, 190, y)

      y += 8
      // Articles
      order.orderItems.forEach((item: any) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (y > 250) {
          doc.addPage()
          y = 20
        }

        doc.text(item.product.name, 20, y)
        doc.text(item.quantity.toString(), 120, y)
        doc.text(`${item.product.price.toLocaleString()} FCFA`, 140, y)
        doc.text(`${(item.quantity * item.product.price).toLocaleString()} FCFA`, 170, y)
        y += 8
      })

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y, 190, y)
      y += 10

      // Résumé des coûts
      doc.text("Sous-total:", 120, y)
      const subtotal = order.totalAmount - order.deliveryFee
      doc.text(`${subtotal.toLocaleString()} FCFA`, 170, y)
      y += 8

      doc.text("Frais de livraison:", 120, y)
      doc.text(`${order.deliveryFee.toLocaleString()} FCFA`, 170, y)
      y += 8

      doc.setFont("helvetica", "bold")
      doc.text("Total:", 120, y)
      doc.text(`${order.totalAmount.toLocaleString()} FCFA`, 170, y)
      doc.setFont("helvetica", "normal")

      // Pied de page
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Merci pour votre commande !", 105, 270, { align: "center" })
      doc.text("Pour toute question, contactez-nous.", 105, 275, { align: "center" })

      // Télécharger le PDF
      doc.save(`commande-${order.id.substring(0, 8)}.pdf`)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      <header className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href={`/salon/${organizationId}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </motion.div>
          </Link>
          <h1 className="text-black font-bold text-xl">Confirmation</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
            <p className="text-gray-600">Votre commande #{order.id.substring(0, 8)} a été enregistrée avec succès.</p>
          </div>

          {/* Informations de la commande */}
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-lg mb-2">Informations de commande</h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Date:</div>
                <div className="font-medium text-right">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</div>

                <div className="text-gray-500">Nom:</div>
                <div className="font-medium text-right">{order.firstName}</div>

                <div className="text-gray-500">Téléphone:</div>
                <div className="font-medium text-right">{order.phoneNumber}</div>

                <div className="text-gray-500">Adresse:</div>
                <div className="font-medium text-right">{order.address}</div>

                {order.additionalInfo && (
                  <>
                    <div className="text-gray-500">Informations:</div>
                    <div className="font-medium text-right">{order.additionalInfo}</div>
                  </>
                )}

                <div className="text-gray-500">Statut:</div>
                <div className="text-right">
                  <Badge
                    className={
                      order.status === "PENDING"
                        ? "bg-yellow-500"
                        : order.status === "CONFIRMED"
                          ? "bg-blue-500"
                          : order.status === "SHIPPED"
                            ? "bg-purple-500"
                            : order.status === "COMPLETED"
                              ? "bg-green-500"
                              : "bg-red-500"
                    }
                  >
                    {order.status === "PENDING"
                      ? "En attente"
                      : order.status === "CONFIRMED"
                        ? "Confirmée"
                        : order.status === "SHIPPED"
                          ? "Expédiée"
                          : order.status === "COMPLETED"
                            ? "Livrée"
                            : "Annulée"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles commandés */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4">Articles commandés</h3>

              <div className="space-y-3 max-h-60 overflow-auto">
                {order.orderItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">
                        {(item.product.price * item.quantity).toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-gray-500">{item.product.price.toLocaleString()} FCFA/unité</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{(order.totalAmount - order.deliveryFee).toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison:</span>
                  <span className="font-medium">{order.deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-amber-600">{order.totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Étapes de livraison */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4">Détails de la livraison</h3>

              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div className="flex items-start gap-4" variants={itemVariants}>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Commande en préparation</h4>
                    <p className="text-sm text-gray-500">Nous préparons votre commande avec soin</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" variants={itemVariants}>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Truck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Livraison prévue</h4>
                    <p className="text-sm text-gray-500">Estimée pour le {formattedDeliveryDate}</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" variants={itemVariants}>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Home className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Paiement à la livraison</h4>
                    <p className="text-sm text-gray-500">Préparez le montant exact ou utilisez Mobile Money</p>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>

          {/* Bouton de téléchargement */}
          <Button
            variant="outline"
            className="w-full mb-4 border-amber-500 text-amber-500 hover:bg-amber-50 flex items-center justify-center"
            onClick={handleDownloadPDF}
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
                Télécharger la facture
              </>
            )}
          </Button>

          <div className="space-y-4">
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={() => (window.location.href = `/salon/${organizationId}`)}
            >
              Retour à l'accueil
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = `/salon/${organizationId}/boutique`)}
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
