"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  iconBgColor: string
}

export function StatCard({ title, value, icon, bgColor, textColor, iconBgColor }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`${bgColor} border-none shadow-sm`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <h3 className={`text-xl font-bold ${textColor} mt-1`}>{value}</h3>
            </div>
            <div className={`${iconBgColor} p-3 rounded-full`}>{icon}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

