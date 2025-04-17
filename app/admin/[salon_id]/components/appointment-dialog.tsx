"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock3, Clock10, Clock4 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type AppointmentDialogProps = {
  appointment: any
  isOpen: boolean
  onClose: () => void
}

export function AppointmentDialog({ appointment, isOpen, onClose }: AppointmentDialogProps) {
  if (!appointment) return null

  // Fonction pour formater le statut
  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "CONFIRMED":
        return "Confirmé"
      case "INCHAIR":
        return "En service"
      case "COMPLETED":
        return "Terminé"
      default:
        return status
    }
  }

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-800"
      case "CONFIRMED":
        return "bg-amber-50 text-amber-800"
      case "INCHAIR":
        return "bg-green-50 text-green-800"
      case "COMPLETED":
        return "bg-gray-50 text-gray-800"
      default:
        return "bg-gray-50 text-gray-800"
    }
  }

  // Fonction pour formater une date
  const formatDate = (dateString: string, formatString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, formatString, { locale: fr })
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date invalide"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Détails du rendez-vous</DialogTitle>
          <DialogDescription>Informations complètes sur le rendez-vous</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getStatusColor(appointment.status)}`}>
            <h3 className="font-bold text-lg mb-2">{appointment.firstName}</h3>
            <div className="flex justify-between items-center">
              <p className="text-sm">{appointment.service.name}</p>
              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                {formatStatus(appointment.status)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <Clock3 className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Heure estimée</p>
              <p className="font-medium text-sm">{appointment.estimatedTime}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <Clock10 className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Ordre</p>
              <p className="font-medium text-sm">DIG-{appointment.orderNumber}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <Clock4 className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Durée</p>
              <p className="font-medium text-sm">
                {appointment.service.durationMin}-{appointment.service.durationMax} min
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date:</span>
              <span className="text-sm font-medium">{formatDate(appointment.date, "EEEE d MMMM yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Téléphone:</span>
              <span className="text-sm font-medium">{appointment.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Prix:</span>
              <span className="text-sm font-medium">{appointment.service.price.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Créé le:</span>
              <span className="text-sm font-medium">{formatDate(appointment.createdAt, "dd/MM/yyyy à HH:mm")}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">Modifier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

