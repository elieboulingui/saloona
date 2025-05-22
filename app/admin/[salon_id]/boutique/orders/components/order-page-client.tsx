"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, ShoppingCart, Package, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { OrderDialog } from "./order-dialog"
import type { OrderStatus } from "@prisma/client"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface OrdersPageClientProps {
    salonId : string
}

export default function OrdersPageClient({salonId}:OrdersPageClientProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null)

  // Récupérer les commandes avec SWR
  const { data, error, isLoading, mutate } = useSWR(`/api/organizations/${salonId}/orders`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const orders = data || []

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Filtrer les commandes en fonction de la recherche et du statut
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm) ||
      order.id.includes(searchTerm)

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

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

  // Gérer l'ouverture du dialogue de détails de commande
  const handleOrderClick = (order: any) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // Gérer la fermeture du dialogue avec succès
  const handleDialogSuccess = () => {
    mutate() // Rafraîchir les données
    setIsDialogOpen(false)
  }

  // Calculer le montant total d'une commande
  const calculateOrderTotal = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-amber-500" />
          </motion.div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Une erreur est survenue lors du chargement des commandes</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une commande..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === null ? "bg-amber-100 text-amber-800" : ""
              }`}
              onClick={() => setStatusFilter(null)}
            >
              Tous les statuts
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""
              }`}
              onClick={() => setStatusFilter("PENDING")}
            >
              En attente
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === "CONFIRMED" ? "bg-blue-100 text-blue-800" : ""
              }`}
              onClick={() => setStatusFilter("CONFIRMED")}
            >
              Confirmées
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === "SHIPPED" ? "bg-purple-100 text-purple-800" : ""
              }`}
              onClick={() => setStatusFilter("SHIPPED")}
            >
              Expédiées
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === "COMPLETED" ? "bg-green-100 text-green-800" : ""
              }`}
              onClick={() => setStatusFilter("COMPLETED")}
            >
              Terminées
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                statusFilter === "CANCELED" ? "bg-red-100 text-red-800" : ""
              }`}
              onClick={() => setStatusFilter("CANCELED")}
            >
              Annulées
            </Badge>
          </div>

          {/* Orders list */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredOrders.map((order: any, index: number) => (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    layout
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOrderClick(order)}
                    className="cursor-pointer"
                  >
                    <Card className="overflow-hidden border shadow-sm">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{order.firstName}</h3>
                              <Badge variant="outline" className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{order.phoneNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {format(new Date(order.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                            </p>
                            <p className="font-bold text-amber-500 mt-1">
                              {calculateOrderTotal(order.orderItems).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              {order.orderItems.length} article{order.orderItems.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
              >
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </motion.div>
              <p>Aucune commande trouvée</p>
              {searchTerm && (
                <Button variant="link" className="mt-2 text-amber-500" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Order Dialog */}
      <OrderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        order={selectedOrder}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

