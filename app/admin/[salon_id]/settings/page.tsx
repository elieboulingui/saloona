"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, User, Bell, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationSettings } from "../components/notification-settings"

export default function SettingsPage() {
    
  const [activeTab, setActiveTab] = useState("notifications")

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
          <h1 className="text-white font-bold text-xl">Paramètres</h1>
          <p className="text-white/80 text-xs">Gérez vos préférences et votre compte</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white">
            <Settings className="h-5 w-5" />
          </motion.div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Sécurité</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div variants={itemVariants}>
                <h2 className="text-lg font-bold mb-4">Profil</h2>
                <p className="text-gray-500">Fonctionnalité à venir...</p>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div variants={itemVariants}>
                <h2 className="text-lg font-bold mb-4">Préférences de notifications</h2>
                <NotificationSettings />
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div variants={itemVariants}>
                <h2 className="text-lg font-bold mb-4">Sécurité</h2>
                <p className="text-gray-500">Fonctionnalité à venir...</p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
