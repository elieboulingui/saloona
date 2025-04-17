"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bell,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
} from "lucide-react"

interface NotificationCardProps {
  notification: any
  index: number
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationCard({ notification, index, onMarkAsRead, onDelete }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notificationData, setNotificationData] = useState<any>(null)

  // Marquer automatiquement comme lu lorsque la notification est développée
  useEffect(() => {
    if (isExpanded && !notification.read) {
      onMarkAsRead(notification.id)
    }
  }, [isExpanded, notification.id, notification.read, onMarkAsRead])

  // Analyser les données JSON de la notification
  useEffect(() => {
    if (notification.data) {
      try {
        const parsedData = JSON.parse(notification.data)
        setNotificationData(parsedData)
      } catch (error) {
        console.error("Erreur lors de l'analyse des données de notification:", error)
      }
    }
  }, [notification.data])

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "transaction":
        return <CreditCard className="h-5 w-5 text-green-500" />
      case "system":
        return <Bell className="h-5 w-5 text-amber-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Formater la date relative
  const formattedDate = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className={`overflow-hidden transition-all duration-200 ${
          notification.read ? "border-gray-200" : "border-amber-300 bg-amber-50"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${notification.read ? "bg-gray-100" : "bg-amber-100"}`}>
              {getNotificationIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && <Badge className="bg-amber-500 text-white">Nouveau</Badge>}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{formattedDate}</p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Détails supplémentaires lorsque la notification est développée */}
          {isExpanded && notificationData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationData.clientName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Client: <span className="font-medium">{notificationData.clientName}</span>
                    </span>
                  </div>
                )}

                {notificationData.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Téléphone: <span className="font-medium">{notificationData.phoneNumber}</span>
                    </span>
                  </div>
                )}

                {notificationData.serviceName && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Service: <span className="font-medium">{notificationData.serviceName}</span>
                    </span>
                  </div>
                )}

                {notificationData.status && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Statut: <span className="font-medium">{notificationData.status}</span>
                    </span>
                  </div>
                )}

                {notificationData.appointmentId && (
                  <div className="flex items-center gap-2 col-span-full">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      ID Rendez-vous: <span className="font-medium">{notificationData.appointmentId}</span>
                    </span>
                  </div>
                )}

                {notificationData.transactionId && (
                  <div className="flex items-center gap-2 col-span-full">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      ID Transaction: <span className="font-medium">{notificationData.transactionId}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => {
                    // Rediriger vers la page appropriée en fonction du type de notification
                    if (notificationData.appointmentId) {
                      window.location.href = `/admin/calendar?appointmentId=${notificationData.appointmentId}`
                    } else if (notificationData.transactionId) {
                      window.location.href = `/admin?transactionId=${notificationData.transactionId}`
                    }
                  }}
                >
                  Voir les détails
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
