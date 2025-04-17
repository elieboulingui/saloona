"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (range: {
    from: Date
    to: Date
  }) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DateRangePicker({ dateRange, onDateRangeChange, isOpen, onOpenChange }: DateRangePickerProps) {
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    from: dateRange.from,
    to: dateRange.to,
  })

  const handleApply = () => {
    if (localDateRange.from && localDateRange.to) {
      onDateRangeChange({
        from: localDateRange.from,
        to: localDateRange.to,
      })
    } else if (localDateRange.from) {
      // Si seule la date de début est définie, utiliser la même date pour la fin
      onDateRangeChange({
        from: localDateRange.from,
        to: localDateRange.from,
      })
    } else {
      // Fallback sur les dates actuelles
      onDateRangeChange(dateRange)
    }
    onOpenChange(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-full text-sm shadow-sm border"
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "d MMM", { locale: fr })} - {format(dateRange.to, "d MMM", { locale: fr })}
                </>
              ) : (
                format(dateRange.from, "d MMMM yyyy", { locale: fr })
              )
            ) : (
              "Sélectionner une période"
            )}
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Sélectionner une période</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setLocalDateRange({ from: undefined, to: undefined })}
                >
                  Réinitialiser
                </Button>
              </div>
              <div className="border rounded-md p-3">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={localDateRange}
                  onSelect={(range) => {
                    if (range) {
                      setLocalDateRange(range)
                    }
                  }}
                  numberOfMonths={1}
                  locale={fr}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs" onClick={handleApply}>
                  Appliquer
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

