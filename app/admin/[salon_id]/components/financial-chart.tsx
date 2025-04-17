"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function FinancialChart() {
  const [loaded, setLoaded] = useState(false)

  // Données simulées pour le graphique
  const data = [
    { month: "Jan", income: 120000, expenses: 80000 },
    { month: "Fév", income: 150000, expenses: 90000 },
    { month: "Mar", income: 180000, expenses: 100000 },
    { month: "Avr", income: 220000, expenses: 120000 },
    { month: "Mai", income: 250000, expenses: 130000 },
    { month: "Juin", income: 200000, expenses: 110000 },
  ]

  // Trouver la valeur maximale pour l'échelle
  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expenses)))

  // Calculer la hauteur des barres en fonction de la valeur maximale
  const getHeight = (value: number) => {
    return (value / maxValue) * 150
  }

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="h-[250px]">
      <div className="flex justify-between items-end h-[200px] mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative h-[150px] w-12 flex items-end justify-center">
              {/* Barre des revenus */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={
                  loaded
                    ? {
                        height: getHeight(item.income),
                        opacity: 1,
                      }
                    : { height: 0, opacity: 0 }
                }
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="w-5 bg-green-400 rounded-t-md absolute z-10"
              />
              {/* Barre des dépenses */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={
                  loaded
                    ? {
                        height: getHeight(item.expenses),
                        opacity: 1,
                      }
                    : { height: 0, opacity: 0 }
                }
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className="w-5 bg-red-400 rounded-t-md absolute ml-6"
              />
            </div>
            <span className="text-xs text-gray-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Revenus</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Dépenses</span>
        </div>
      </div>
    </div>
  )
}

