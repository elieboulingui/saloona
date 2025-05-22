"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Bell, Search, CheckCircle, Loader2, CheckCheck, AlertCircle, RefreshCw } from "lucide-react"
import { NotificationCard } from "./components/notification-card"
import { EmptyState } from "./components/empty"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("unread")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // Récupérer les notifications avec SWR
  const {
    data: notifications,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
  })

  // Filtrer les notifications en fonction de l'onglet actif et du terme de recherche
  const filteredNotifications =
    notifications?.filter((notification: any) => {
      const matchesTab = activeTab === "all" ? true : activeTab === "unread" ? !notification.read : notification.read

      const matchesSearch =
        searchTerm === "" ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesTab && matchesSearch
    }) || []

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    setIsMarkingAllRead(true)
    try {
      const unreadNotifications = notifications?.filter((notification: any) => !notification.read) || []

      await Promise.all(
        unreadNotifications.map((notification: any) =>
          fetch(`/api/notifications/${notification.id}`, {
            method: "PATCH",
          }),
        ),
      )

      mutate()
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  // Supprimer une notification
  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      mutate()
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error)
    }
  }

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      })

      mutate()
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error)
    }
  }

  // Compter les notifications non lues
  const unreadCount = notifications?.filter((notification: any) => !notification.read).length || 0

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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-white font-bold text-xl">Centre de notifications</h1>
          <p className="text-white/80 text-xs">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-white/20 p-2 rounded-full text-white"
            onClick={() => mutate()}
            title="Rafraîchir"
          >
            <RefreshCw className="h-5 w-5" />
          </motion.button>
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="bg-white/20 p-2 rounded-full text-white"
              onClick={markAllAsRead}
              disabled={isMarkingAllRead}
              title="Marquer tout comme lu"
            >
              {isMarkingAllRead ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCheck className="h-5 w-5" />}
            </motion.button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans les notifications..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Toutes</span>
                  <Badge variant="outline" className="ml-1 bg-gray-100">
                    {notifications?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Non lues</span>
                  <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-800">
                    {unreadCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="read" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Lues</span>
                  <Badge variant="outline" className="ml-1 bg-green-100 text-green-800">
                    {(notifications?.length || 0) - unreadCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Liste des notifications */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  Une erreur est survenue lors du chargement des notifications
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-12 w-12 text-gray-300" />}
                  title="Aucune notification"
                  description="Vous n'avez aucune notification pour le moment."
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredNotifications.map((notification: any, index: number) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  Une erreur est survenue lors du chargement des notifications
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-12 w-12 text-gray-300" />}
                  title="Aucune notification non lue"
                  description="Toutes vos notifications ont été lues."
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredNotifications.map((notification: any, index: number) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="read" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  Une erreur est survenue lors du chargement des notifications
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={<AlertCircle className="h-12 w-12 text-gray-300" />}
                  title="Aucune notification lue"
                  description="Vous n'avez pas encore lu de notifications."
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredNotifications.map((notification: any, index: number) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
