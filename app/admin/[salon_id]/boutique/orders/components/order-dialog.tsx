"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Phone, Calendar, User } from "lucide-react"
import type { OrderStatus } from "@prisma/client"
import { updateOrderStatus } from "../actions"
import Image from "next/image"

interface OrderDialogProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onSuccess: () => void
}

export function OrderDialog({ isOpen, onClose, order, onSuccess }: OrderDialogProps) {
  const [status, setStatus] = useState<OrderStatus | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Réinitialiser l'état lorsque l'ordre change
  if (order && status === "" && order.status) {
    setStatus(order.status)
  }

  if (!order) return null

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "CONFIRMED":
        return "Confirmée"
      case "SHIPPED":
        return "Expédiée"
      case "COMPLETED":
        return "Terminée"
      case "CANCELED":
        return "Annulée"
      default:
        return status
    }
  }

  // Calculer le montant total de la commande
  const calculateTotal = () => {
    return order.orderItems.reduce((total: number, item: any) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  // Gérer le changement de statut
  const handleStatusChange = async () => {
    if (status === order.status) {
      onClose()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateOrderStatus(order.id, status as OrderStatus)

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Une erreur est survenue")
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Commande
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <div className="space-y-4">
          {/* Informations client */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.firstName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{order.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(order.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}</span>
            </div>
          </div>

          {/* Articles de la commande */}
          <div className="space-y-3">
            <h3 className="font-medium">Articles commandés</h3>
            {order.orderItems.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Quantité: {item.quantity}</span>
                    <span className="font-medium text-amber-500">{item.product.price.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la commande */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Sous-total</span>
              <span>{calculateTotal().toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Livraison</span>
              <span>{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-amber-500">{(calculateTotal() + 1000).toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Changer le statut */}
          <div className="space-y-2">
            <h3 className="font-medium">Changer le statut</h3>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="SHIPPED">Expédiée</SelectItem>
                <SelectItem value="COMPLETED">Terminée</SelectItem>
                <SelectItem value="CANCELED">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleStatusChange} className="bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

