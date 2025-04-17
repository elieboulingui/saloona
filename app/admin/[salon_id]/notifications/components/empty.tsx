"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionFn?: () => void
}

export function EmptyState({ icon, title, description, actionLabel = "Rafraîchir", actionFn }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        className="mb-4 p-4 bg-gray-100 rounded-full"
      >
        {icon}
      </motion.div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>

      {actionFn && (
        <Button variant="outline" onClick={actionFn} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
