"use client"

import { motion } from "framer-motion"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TransactionItemProps {
  transaction: any
  index: number
}

export function TransactionItem({ transaction, index }: TransactionItemProps) {
  // Fonction pour obtenir la couleur du type de transaction
  const getTypeColor = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ORDER":
        return "bg-green-50 text-green-700 border-green-200"
      case "WITHDRAWAL":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "processed":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
      case "ready":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "failed":
      case "expired":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Fonction pour obtenir le libellé du type de transaction
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "Rendez-vous"
      case "ORDER":
        return "Commande"
      case "WITHDRAWAL":
        return "Retrait"
      default:
        return type
    }
  }

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé"
      case "processed":
        return "Traité"
      case "pending":
        return "En attente"
      case "ready":
        return "Prêt"
      case "failed":
        return "Échoué"
      case "expired":
        return "Expiré"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "dd/MM/yyyy à HH:mm", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="p-3 border overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-1 mb-1">
              <span className="font-medium text-sm truncate max-w-[150px]">{transaction.shortDescription}</span>
              <Badge variant="outline" className={`text-xs ${getTypeColor(transaction.type)}`}>
                {getTypeLabel(transaction.type)}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
                {getStatusLabel(transaction.status)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
          </div>
          <div className={`text-right ${transaction.type === "WITHDRAWAL" ? "text-red-600" : "text-green-600"}`}>
            <p className="font-bold">
              {transaction.type === "WITHDRAWAL" ? "-" : "+"}
              {transaction.amount.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

