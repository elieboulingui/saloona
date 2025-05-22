"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarPickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  className?: string
}

export function CalendarPicker({ selectedDate, onDateSelect, className }: CalendarPickerProps) {
  // Initialiser avec la semaine contenant la date sélectionnée ou la date actuelle
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(selectedDate || new Date()))
  const [weekDays, setWeekDays] = useState<Date[]>([])

  // Jours de la semaine en français
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  // Obtenir le premier jour de la semaine (lundi) pour une date donnée
  function getWeekStart(date: Date): Date {
    const day = date.getDay() // 0 = dimanche, 1 = lundi, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Ajuster pour commencer le lundi
    return new Date(date.getFullYear(), date.getMonth(), diff)
  }

  // Format le mois et l'année pour l'affichage en français
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  // Générer les jours de la semaine actuelle
  const generateWeekDays = (weekStart: Date) => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    setWeekDays(days)
  }

  // Naviguer vers la semaine précédente
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart)
    prevWeek.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(prevWeek)
  }

  // Naviguer vers la semaine suivante
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(nextWeek)
  }

  // Vérifier si une date est la même que la date sélectionnée
  const isSameDate = (date1: Date, date2: Date | null): boolean => {
    if (!date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Vérifier si un jour est un dimanche
  const isSunday = (date: Date): boolean => {
    return date.getDay() === 0
  }

  // Vérifier si une date est dans le passé (avant aujourd'hui)
  const isPastDate = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Mettre à jour le calendrier lorsque la semaine change
  useEffect(() => {
    generateWeekDays(currentWeekStart)
  }, [currentWeekStart])

  // Déterminer si la semaine chevauche deux mois
  const isMultiMonth = weekDays.length > 0 && weekDays[0].getMonth() !== weekDays[weekDays.length - 1].getMonth()

  // Formater l'affichage du mois/année pour une semaine qui chevauche deux mois
  const getMonthYearDisplay = () => {
    if (!weekDays.length) return ""

    if (isMultiMonth) {
      const firstMonth = weekDays[0].toLocaleDateString("fr-FR", { month: "long" })
      const lastMonth = weekDays[6].toLocaleDateString("fr-FR", { month: "long" })
      const year = weekDays[0].getFullYear()
      // Première lettre en majuscule
      const capitalizedFirstMonth = firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1)
      const capitalizedLastMonth = lastMonth.charAt(0).toUpperCase() + lastMonth.slice(1)
      return `${capitalizedFirstMonth} - ${capitalizedLastMonth} ${year}`
    } else {
      // Première lettre en majuscule
      const monthYear = formatMonthYear(weekDays[0])
      return monthYear.charAt(0).toUpperCase() + monthYear.slice(1)
    }
  }

  // Gérer la sélection d'une date
  const handleDateSelect = (date: Date) => {
    // Ne pas permettre la sélection du dimanche ou des dates passées
    if (isSunday(date) || isPastDate(date)) return

    // Normaliser la date sélectionnée
    const normalizedDate = new Date(date)
    normalizedDate.setHours(12, 0, 0, 0) // Fixer à midi pour éviter les problèmes de fuseau horaire

    onDateSelect(normalizedDate)
  }

  return (
    <div className={cn("bg-white rounded-xl p-4 text-black", className)}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-center font-medium">{getMonthYearDisplay()}</span>
        <div className="flex space-x-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0" onClick={goToNextWeek}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-xs font-medium text-gray-500 mb-2">
            {day}
          </div>
        ))}

        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            whileTap={!isSunday(day) && !isPastDate(day) ? { scale: 0.9 } : {}}
            className={cn(
              "rounded-full w-10 h-10 flex items-center justify-center text-sm mx-auto",
              isSunday(day) || isPastDate(day)
                ? "text-gray-300 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100",
              isSameDate(day, selectedDate) ? "bg-amber-500 text-white font-medium" : "",
            )}
            onClick={() => handleDateSelect(day)}
          >
            {day.getDate()}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

