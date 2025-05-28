"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fr } from "date-fns/locale"
import {
  format,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, ArrowDownLeft, CreditCard, Phone } from 'lucide-react'

// Données d'exemple étendues pour le portefeuille
const transactionsData = [
  // Décembre 2025
  { id: 1, type: "entree", amount: 45000, phone: "077 12 34 56", date: "2025-12-28", description: "Salaire décembre" },
  { id: 2, type: "retrait", amount: 8000, phone: "077 98 76 54", date: "2025-12-28", description: "Courses de Noël" },
  { id: 3, type: "entree", amount: 15000, phone: "077 11 22 33", date: "2025-12-27", description: "Bonus de fin d'année" },
  { id: 4, type: "retrait", amount: 12000, phone: "077 44 55 66", date: "2025-12-26", description: "Cadeaux famille" },
  { id: 5, type: "entree", amount: 25000, phone: "077 77 88 99", date: "2025-12-25", description: "Étrennes reçues" },
  { id: 6, type: "retrait", amount: 5000, phone: "077 33 44 55", date: "2025-12-24", description: "Réveillon" },
  { id: 7, type: "entree", amount: 18000, phone: "077 66 77 88", date: "2025-12-23", description: "Freelance web" },
  { id: 8, type: "retrait", amount: 3500, phone: "077 22 33 44", date: "2025-12-22", description: "Transport" },
  { id: 9, type: "entree", amount: 12000, phone: "077 55 66 77", date: "2025-12-21", description: "Vente en ligne" },
  { id: 10, type: "retrait", amount: 7000, phone: "077 88 99 00", date: "2025-12-20", description: "Électricité" },

  // Novembre 2025
  { id: 11, type: "entree", amount: 42000, phone: "077 10 20 30", date: "2025-11-30", description: "Salaire novembre" },
  { id: 12, type: "retrait", amount: 6000, phone: "077 40 50 60", date: "2025-11-29", description: "Courses alimentaires" },
  { id: 13, type: "entree", amount: 20000, phone: "077 70 80 90", date: "2025-11-28", description: "Consultation privée" },
  { id: 14, type: "retrait", amount: 4500, phone: "077 13 24 35", date: "2025-11-27", description: "Essence voiture" },
  { id: 15, type: "entree", amount: 8000, phone: "077 46 57 68", date: "2025-11-26", description: "Remboursement ami" },
  { id: 16, type: "retrait", amount: 15000, phone: "077 79 80 91", date: "2025-11-25", description: "Réparation moto" },
  { id: 17, type: "entree", amount: 35000, phone: "077 12 23 34", date: "2025-11-24", description: "Projet développement" },
  { id: 18, type: "retrait", amount: 2800, phone: "077 45 56 67", date: "2025-11-23", description: "Internet mensuel" },
  { id: 19, type: "entree", amount: 16000, phone: "077 78 89 90", date: "2025-11-22", description: "Formation dispensée" },
  { id: 20, type: "retrait", amount: 9000, phone: "077 01 12 23", date: "2025-11-21", description: "Vêtements" },

  // Octobre 2025
  { id: 21, type: "entree", amount: 40000, phone: "077 34 45 56", date: "2025-10-31", description: "Salaire octobre" },
  { id: 22, type: "retrait", amount: 5500, phone: "077 67 78 89", date: "2025-10-30", description: "Pharmacie" },
  { id: 23, type: "entree", amount: 22000, phone: "077 90 01 12", date: "2025-10-29", description: "Vente équipement" },
  { id: 24, type: "retrait", amount: 8500, phone: "077 23 34 45", date: "2025-10-28", description: "Restaurant famille" },
  { id: 25, type: "entree", amount: 14000, phone: "077 56 67 78", date: "2025-10-27", description: "Cours particuliers" },
  { id: 26, type: "retrait", amount: 3200, phone: "077 89 90 01", date: "2025-10-26", description: "Abonnement gym" },
  { id: 27, type: "entree", amount: 28000, phone: "077 12 13 14", date: "2025-10-25", description: "Contrat maintenance" },
  { id: 28, type: "retrait", amount: 6500, phone: "077 45 46 47", date: "2025-10-24", description: "Assurance auto" },
  { id: 29, type: "entree", amount: 11000, phone: "077 78 79 80", date: "2025-10-23", description: "Dividendes" },
  { id: 30, type: "retrait", amount: 4200, phone: "077 01 02 03", date: "2025-10-22", description: "Coiffeur + spa" },

  // Septembre 2025
  { id: 31, type: "entree", amount: 38000, phone: "077 14 25 36", date: "2025-09-30", description: "Salaire septembre" },
  { id: 32, type: "retrait", amount: 7200, phone: "077 47 58 69", date: "2025-09-29", description: "Rentrée scolaire" },
  { id: 33, type: "entree", amount: 19000, phone: "077 70 81 92", date: "2025-09-28", description: "Mission courte" },
  { id: 34, type: "retrait", amount: 5800, phone: "077 03 14 25", date: "2025-09-27", description: "Fournitures bureau" },
  { id: 35, type: "entree", amount: 13000, phone: "077 36 47 58", date: "2025-09-26", description: "Coaching en ligne" },
  { id: 36, type: "retrait", amount: 9500, phone: "077 69 70 81", date: "2025-09-25", description: "Voyage weekend" },
  { id: 37, type: "entree", amount: 26000, phone: "077 92 03 14", date: "2025-09-24", description: "Audit comptable" },
  { id: 38, type: "retrait", amount: 3800, phone: "077 25 36 47", date: "2025-09-23", description: "Médicaments" },
  { id: 39, type: "entree", amount: 17000, phone: "077 58 69 70", date: "2025-09-22", description: "Réparation PC" },
  { id: 40, type: "retrait", amount: 6200, phone: "077 81 92 03", date: "2025-09-21", description: "Cantine mensuelle" },

  // Août 2025
  { id: 41, type: "entree", amount: 35000, phone: "077 15 26 37", date: "2025-08-31", description: "Salaire août" },
  { id: 42, type: "retrait", amount: 12000, phone: "077 48 59 60", date: "2025-08-30", description: "Vacances plage" },
  { id: 43, type: "entree", amount: 21000, phone: "077 71 82 93", date: "2025-08-29", description: "Vente artisanat" },
  { id: 44, type: "retrait", amount: 4600, phone: "077 04 15 26", date: "2025-08-28", description: "Climatisation" },
  { id: 45, type: "entree", amount: 15000, phone: "077 37 48 59", date: "2025-08-27", description: "Location saisonnière" },
  { id: 46, type: "retrait", amount: 8800, phone: "077 60 71 82", date: "2025-08-26", description: "Hôtel famille" },
  { id: 47, type: "entree", amount: 29000, phone: "077 93 04 15", date: "2025-08-25", description: "Événementiel" },
  { id: 48, type: "retrait", amount: 5400, phone: "077 26 37 48", date: "2025-08-24", description: "Activités enfants" },
  { id: 49, type: "entree", amount: 12500, phone: "077 59 60 71", date: "2025-08-23", description: "Tutorat été" },
  { id: 50, type: "retrait", amount: 7600, phone: "077 82 93 04", date: "2025-08-22", description: "Équipement sport" },

  // Juillet 2025
  { id: 51, type: "entree", amount: 33000, phone: "077 16 27 38", date: "2025-07-31", description: "Salaire juillet" },
  { id: 52, type: "retrait", amount: 10000, phone: "077 49 50 61", date: "2025-07-30", description: "Préparatifs voyage" },
  { id: 53, type: "entree", amount: 18000, phone: "077 72 83 94", date: "2025-07-29", description: "Freelance design" },
  { id: 54, type: "retrait", amount: 6800, phone: "077 05 16 27", date: "2025-07-28", description: "Barbecue amis" },
  { id: 55, type: "entree", amount: 24000, phone: "077 38 49 50", date: "2025-07-27", description: "Consultation juridique" },
  { id: 56, type: "retrait", amount: 4400, phone: "077 61 72 83", date: "2025-07-26", description: "Piscine municipale" },
  { id: 57, type: "entree", amount: 16500, phone: "077 94 05 16", date: "2025-07-25", description: "Cours de langue" },
  { id: 58, type: "retrait", amount: 9200, phone: "077 27 38 49", date: "2025-07-24", description: "Shopping été" },
  { id: 59, type: "entree", amount: 31000, phone: "077 50 61 72", date: "2025-07-23", description: "Contrat annuel" },
  { id: 60, type: "retrait", amount: 5600, phone: "077 83 94 05", date: "2025-07-22", description: "Réparation clim" },

  // Juin 2025
  { id: 61, type: "entree", amount: 36000, phone: "077 17 28 39", date: "2025-06-30", description: "Salaire juin" },
  { id: 62, type: "retrait", amount: 8400, phone: "077 40 51 62", date: "2025-06-29", description: "Fête des pères" },
  { id: 63, type: "entree", amount: 20000, phone: "077 73 84 95", date: "2025-06-28", description: "Projet mobile" },
  { id: 64, type: "retrait", amount: 6000, phone: "077 06 17 28", date: "2025-06-27", description: "Jardinage" },
  { id: 65, type: "entree", amount: 14500, phone: "077 39 40 51", date: "2025-06-26", description: "Réparation auto" },
  { id: 66, type: "retrait", amount: 7800, phone: "077 62 73 84", date: "2025-06-25", description: "Anniversaire" },
  { id: 67, type: "entree", amount: 27000, phone: "077 95 06 17", date: "2025-06-24", description: "Formation entreprise" },
  { id: 68, type: "retrait", amount: 4800, phone: "077 28 39 40", date: "2025-06-23", description: "Cinéma famille" },
  { id: 69, type: "entree", amount: 19500, phone: "077 51 62 73", date: "2025-06-22", description: "Vente meubles" },
  { id: 70, type: "retrait", amount: 9600, phone: "077 84 95 06", date: "2025-06-21", description: "Équipement maison" },

  // Mai 2025
  { id: 71, type: "entree", amount: 39000, phone: "077 18 29 30", date: "2025-05-31", description: "Salaire mai" },
  { id: 72, type: "retrait", amount: 7400, phone: "077 41 52 63", date: "2025-05-30", description: "Fête des mères" },
  { id: 73, type: "entree", amount: 22000, phone: "077 74 85 96", date: "2025-05-29", description: "Consulting IT" },
  { id: 74, type: "retrait", amount: 5200, phone: "077 07 18 29", date: "2025-05-28", description: "Entretien voiture" },
  { id: 75, type: "entree", amount: 16000, phone: "077 30 41 52", date: "2025-05-27", description: "Cours particuliers" },
  { id: 76, type: "retrait", amount: 8600, phone: "077 63 74 85", date: "2025-05-26", description: "Week-end détente" },
  { id: 77, type: "entree", amount: 25000, phone: "077 96 07 18", date: "2025-05-25", description: "Audit système" },
  { id: 78, type: "retrait", amount: 4000, phone: "077 29 30 41", date: "2025-05-24", description: "Coiffeur + manucure" },
  { id: 79, type: "entree", amount: 18500, phone: "077 52 63 74", date: "2025-05-23", description: "Traduction documents" },
  { id: 80, type: "retrait", amount: 6400, phone: "077 85 96 07", date: "2025-05-22", description: "Livraison courses" },

  // Avril 2025
  { id: 81, type: "entree", amount: 37000, phone: "077 19 20 31", date: "2025-04-30", description: "Salaire avril" },
  { id: 82, type: "retrait", amount: 9800, phone: "077 42 53 64", date: "2025-04-29", description: "Vacances Pâques" },
  { id: 83, type: "entree", amount: 23000, phone: "077 75 86 97", date: "2025-04-28", description: "Développement app" },
  { id: 84, type: "retrait", amount: 5600, phone: "077 08 19 20", date: "2025-04-27", description: "Produits beauté" },
  { id: 85, type: "entree", amount: 17500, phone: "077 31 42 53", date: "2025-04-26", description: "Coaching sportif" },
  { id: 86, type: "retrait", amount: 7200, phone: "077 64 75 86", date: "2025-04-25", description: "Sortie restaurant" },
  { id: 87, type: "entree", amount: 26500, phone: "077 97 08 19", date: "2025-04-24", description: "Mission expertise" },
  { id: 88, type: "retrait", amount: 4200, phone: "077 20 31 42", date: "2025-04-23", description: "Abonnements divers" },
  { id: 89, type: "entree", amount: 21000, phone: "077 53 64 75", date: "2025-04-22", description: "Vente en ligne" },
  { id: 90, type: "retrait", amount: 8000, phone: "077 86 97 08", date: "2025-04-21", description: "Équipement bureau" },


  // Mai 2025
  { id: 91, type: "entree", amount: 34000, phone: "077 10 21 32", date: "2025-05-31", description: "Salaire mai" },
  { id: 92, type: "retrait", amount: 6600, phone: "077 43 54 65", date: "2025-05-30", description: "Journée femme" },
  { id: 93, type: "entree", amount: 19000, phone: "077 76 87 98", date: "2025-05-29", description: "Freelance rédaction" },
  { id: 94, type: "retrait", amount: 7800, phone: "077 09 10 21", date: "2025-05-28", description: "Printemps shopping" },
  { id: 95, type: "entree", amount: 15500, phone: "077 32 43 54", date: "2025-05-27", description: "Réparation électronique" },
  { id: 96, type: "retrait", amount: 5000, phone: "077 65 76 87", date: "2025-05-26", description: "Sortie culturelle" },
  { id: 97, type: "entree", amount: 28000, phone: "077 98 09 10", date: "2025-05-25", description: "Contrat maintenance" },
  { id: 98, type: "retrait", amount: 4600, phone: "077 21 32 43", date: "2025-05-24", description: "Produits ménagers" },
  { id: 99, type: "entree", amount: 20500, phone: "077 54 65 76", date: "2025-05-23", description: "Formation dispensée" },
  { id: 100, type: "retrait", amount: 9000, phone: "077 87 98 09", date: "2025-05-22", description: "Rénovation chambre" },

  // Mars 2025
  { id: 91, type: "entree", amount: 34000, phone: "077 10 21 32", date: "2025-03-31", description: "Salaire mars" },
  { id: 92, type: "retrait", amount: 6600, phone: "077 43 54 65", date: "2025-03-30", description: "Journée femme" },
  { id: 93, type: "entree", amount: 19000, phone: "077 76 87 98", date: "2025-03-29", description: "Freelance rédaction" },
  { id: 94, type: "retrait", amount: 7800, phone: "077 09 10 21", date: "2025-03-28", description: "Printemps shopping" },
  { id: 95, type: "entree", amount: 15500, phone: "077 32 43 54", date: "2025-03-27", description: "Réparation électronique" },
  { id: 96, type: "retrait", amount: 5000, phone: "077 65 76 87", date: "2025-03-26", description: "Sortie culturelle" },
  { id: 97, type: "entree", amount: 28000, phone: "077 98 09 10", date: "2025-03-25", description: "Contrat maintenance" },
  { id: 98, type: "retrait", amount: 4600, phone: "077 21 32 43", date: "2025-03-24", description: "Produits ménagers" },
  { id: 99, type: "entree", amount: 20500, phone: "077 54 65 76", date: "2025-03-23", description: "Formation dispensée" },
  { id: 100, type: "retrait", amount: 9000, phone: "077 87 98 09", date: "2025-03-22", description: "Rénovation chambre" },
]

export default function PortefeuillePage() {
  const [activeTab, setActiveTab] = useState<"entrees" | "retraits">("entrees")
  const [filterPeriod, setFilterPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("jour")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "calendar">("day")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newWithdrawal, setNewWithdrawal] = useState({
    amount: "",
    phone: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Fonction pour filtrer les transactions selon la période
  const getFilteredTransactions = useMemo(() => {
    const selectedDateObj = selectedDate

    return transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      switch (filterPeriod) {
        case "jour":
          return isSameDay(transactionDate, selectedDateObj)
        case "semaine":
          return isSameWeek(transactionDate, selectedDateObj, { locale: fr })
        case "mois":
          return isSameMonth(transactionDate, selectedDateObj)
        case "annee":
          return isSameYear(transactionDate, selectedDateObj)
        default:
          return isSameDay(transactionDate, selectedDateObj)
      }
    })
  }, [filterPeriod, selectedDate])

  // Calculs des totaux
  const totals = useMemo(() => {
    const filtered = getFilteredTransactions
    const entrees = filtered.filter((t) => t.type === "entree").reduce((sum, t) => sum + t.amount, 0)
    const retraits = filtered.filter((t) => t.type === "retrait").reduce((sum, t) => sum + t.amount, 0)
    const soldeActuel = entrees - retraits

    return { entrees, retraits, soldeActuel }
  }, [getFilteredTransactions])

  // Transactions filtrées par type actif
  const displayedTransactions = useMemo(() => {
    return getFilteredTransactions.filter((t) => (activeTab === "entrees" ? t.type === "entree" : t.type === "retrait"))
  }, [getFilteredTransactions, activeTab])

  // Navigation selon la période
  const navigateDate = (direction: "prev" | "next") => {
    const increment = direction === "next" ? 1 : -1

    switch (filterPeriod) {
      case "jour":
        setSelectedDate(addDays(selectedDate, increment))
        break
      case "semaine":
        setSelectedDate(addWeeks(selectedDate, increment))
        break
      case "mois":
        setSelectedDate(addMonths(selectedDate, increment))
        break
      case "annee":
        setSelectedDate(addYears(selectedDate, increment))
        break
    }
  }

  // Formatage de la date selon la période
  const formatDisplayDate = () => {
    switch (filterPeriod) {
      case "jour":
        return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
      case "semaine":
        const weekStart = startOfWeek(selectedDate, { locale: fr })
        const weekEnd = endOfWeek(selectedDate, { locale: fr })
        return `Semaine du ${format(weekStart, "d MMM", { locale: fr })} au ${format(weekEnd, "d MMM yyyy", { locale: fr })}`
      case "mois":
        return format(selectedDate, "MMMM yyyy", { locale: fr })
      case "annee":
        return format(selectedDate, "yyyy", { locale: fr })
      default:
        return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
    }
  }

  // Vérifier si c'est la période actuelle
  const isCurrentPeriod = () => {
    const now = new Date()
    switch (filterPeriod) {
      case "jour":
        return isToday(selectedDate)
      case "semaine":
        return isSameWeek(selectedDate, now, { locale: fr })
      case "mois":
        return isSameMonth(selectedDate, now)
      case "annee":
        return isSameYear(selectedDate, now)
      default:
        return isToday(selectedDate)
    }
  }

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nouveau retrait:", newWithdrawal)
    setIsSheetOpen(false)
    setNewWithdrawal({
      amount: "",
      phone: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="py-5">
      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
          {/* Navigation de date */}
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className={isCurrentPeriod() ? "bg-amber-100 border-amber-300" : ""}
            >
              {filterPeriod === "jour"
                ? "Aujourd'hui"
                : filterPeriod === "semaine"
                  ? "Cette semaine"
                  : filterPeriod === "mois"
                    ? "Ce mois"
                    : "Cette année"}
            </Button>

            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setViewMode(viewMode === "calendar" ? "day" : "calendar")}
                      className="bg-gray-100 text-black hover:bg-gray-200"
                    >
                      <span className="font-medium">{formatDisplayDate()}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cliquez pour ouvrir le calendrier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="icon" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* En-tête avec filtres */}
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Select
                value={filterPeriod}
                onValueChange={(value: "jour" | "semaine" | "mois" | "annee") => setFilterPeriod(value)}
              >
                <SelectTrigger className="w-full sm:w-36 bg-white text-gray-700 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-2xl rounded-xl">
                  <SelectItem value="jour" className="rounded-lg text-gray-700">
                    📅 Jour
                  </SelectItem>
                  <SelectItem value="semaine" className="rounded-lg text-gray-700">
                    📊 Semaine
                  </SelectItem>
                  <SelectItem value="mois" className="rounded-lg text-gray-700">
                    📈 Mois
                  </SelectItem>
                  <SelectItem value="annee" className="rounded-lg text-gray-700">
                    🗓️ Année
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        {viewMode === "calendar" && (
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-300">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                  setViewMode("day")
                }
              }}
              locale={fr}
              className="mx-auto"
              classNames={{
                day_selected: "bg-amber-500 text-white hover:bg-amber-600",
                day_today: "bg-amber-100 text-amber-900",
              }}
            />
          </div>
        )}

        {/* Cartes de résumé */}
        {viewMode === "day" && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-[#FDE7A8] border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative">
                <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Solde Actuel</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">
                        {totals.soldeActuel.toLocaleString()}{" "}
                        <span className="text-xs sm:text-lg text-gray-600">Fcfa</span>
                      </p>
                    </div>
                    <div className="bg-amber-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#e8fcf0] border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative">
                <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Retraits</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">
                        {totals.retraits.toLocaleString()}{" "}
                        <span className="text-xs sm:text-lg text-gray-600">Fcfa</span>
                      </p>
                    </div>
                    <div className="bg-green-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Onglets et bouton d'ajout */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex bg-white border-gray-300 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg">
                <Button
                  variant={activeTab === "entrees" ? "default" : "ghost"}
                  onClick={() => setActiveTab("entrees")}
                  className={`rounded-lg sm:rounded-xl px-4 py-2 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-300 ${activeTab === "entrees"
                      ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  💰 Entrée
                </Button>
                <Button
                  variant={activeTab === "retraits" ? "default" : "ghost"}
                  onClick={() => setActiveTab("retraits")}
                  className={`rounded-lg sm:rounded-xl px-4 py-2 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-300 ${activeTab === "retraits"
                      ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  💸 Retrait
                </Button>
              </div>
            </div>

            {/* Tableau des transactions */}
            <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 bg-amber-50">
                      <TableHead className="font-bold text-gray-700 py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm">
                        {activeTab === "entrees" ? "💰 Entrée" : "💸 Sortie"}
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm">
                        📱 {activeTab === "entrees" ? "N° Tel Client" : "N° Tel"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTransactions.length > 0 ? (
                      displayedTransactions.map((transaction, index) => (
                        <TableRow
                          key={transaction.id}
                          className="border-0 hover:bg-amber-50 transition-all duration-300 group"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animation: "fadeInUp 0.5s ease-out forwards",
                          }}
                        >
                          <TableCell className="font-bold text-base sm:text-lg py-3 px-4 sm:py-4 sm:px-6 group-hover:scale-105 transition-transform duration-300 text-gray-800">
                            {transaction.amount.toLocaleString()}{" "}
                            <span className="text-xs sm:text-sm text-gray-600">Fcfa</span>
                          </TableCell>
                          <TableCell className="py-3 px-4 sm:py-4 sm:px-6 text-gray-700 font-mono text-xs sm:text-sm">
                            {transaction.phone}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-8 sm:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <Phone className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300" />
                            <p className="text-sm sm:text-lg font-medium">Aucune transaction pour cette période</p>
                            <p className="text-xs sm:text-sm">
                              Changez la période ou effectuez une nouvelle transaction
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bouton d'ajout - affiché seulement pour les retraits */}
            {activeTab === "retraits" && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <div className="flex justify-end ">
                    <Button
                      size="icon"
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 w-12 h-12 sm:w-14 sm:h-14"
                    >
                      <Plus className="h-5 sm:h-6 w-5 sm:w-6" />
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent className="bg-white border-gray-300 shadow-2xl w-full sm:max-w-md">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl">
                        <ArrowDownLeft className="h-5 w-5 text-white" />
                      </div>
                      <SheetTitle className="text-xl sm:text-2xl font-bold text-gray-800">Nouveau Retrait</SheetTitle>
                    </div>
                    <SheetDescription className="text-gray-600 text-sm sm:text-base">
                      Effectuez un nouveau retrait de votre portefeuille
                    </SheetDescription>
                  </SheetHeader>

                  <form onSubmit={handleSubmitWithdrawal} className="space-y-4 sm:space-y-6 px-3">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Montant (Fcfa)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Ex: 5000"
                        value={newWithdrawal.amount}
                        onChange={(e) => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Numéro de téléphone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ex: 077 00 00 01"
                        value={newWithdrawal.phone}
                        onChange={(e) => setNewWithdrawal({ ...newWithdrawal, phone: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Ex: Retrait ATM, Paiement facture..."
                        value={newWithdrawal.description}
                        onChange={(e) => setNewWithdrawal({ ...newWithdrawal, description: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newWithdrawal.date}
                        onChange={(e) => setNewWithdrawal({ ...newWithdrawal, date: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex-1 rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                      >
                        Effectuer
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
