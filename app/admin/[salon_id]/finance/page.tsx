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
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, DollarSign, CalendarIcon, Receipt } from 'lucide-react'

// Données d'exemple étendues pour les finances
const transactionsData = [
  // Décembre 2025
  { id: 1, type: "recette", amount: 85000, description: "Contrat développement site e-commerce", date: "2025-12-28", category: "service" },
  { id: 2, type: "depense", amount: 12000, description: "Achat équipement informatique", date: "2025-12-28", category: "materiel" },
  { id: 3, type: "recette", amount: 45000, description: "Formation React avancée", date: "2025-12-27", category: "formation" },
  { id: 4, type: "depense", amount: 8500, description: "Frais de déplacement client", date: "2025-12-26", category: "transport" },
  { id: 5, type: "recette", amount: 32000, description: "Maintenance système client", date: "2025-12-25", category: "maintenance" },
  { id: 6, type: "depense", amount: 6000, description: "Abonnement logiciels professionnels", date: "2025-12-24", category: "abonnement" },
  { id: 7, type: "recette", amount: 28000, description: "Consultation architecture logicielle", date: "2025-12-23", category: "conseil" },
  { id: 8, type: "depense", amount: 4500, description: "Frais bancaires et commissions", date: "2025-12-22", category: "frais" },
  { id: 9, type: "recette", amount: 55000, description: "Projet mobile iOS/Android", date: "2025-12-21", category: "service" },
  { id: 10, type: "depense", amount: 9000, description: "Marketing digital et publicité", date: "2025-12-20", category: "marketing" },

  // Novembre 2025
  { id: 11, type: "recette", amount: 75000, description: "Audit sécurité informatique", date: "2025-11-30", category: "audit" },
  { id: 12, type: "depense", amount: 11000, description: "Formation équipe développement", date: "2025-11-29", category: "formation" },
  { id: 13, type: "recette", amount: 42000, description: "Intégration API paiement", date: "2025-11-28", category: "integration" },
  { id: 14, type: "depense", amount: 7200, description: "Hébergement serveurs cloud", date: "2025-11-27", category: "hebergement" },
  { id: 15, type: "recette", amount: 38000, description: "Optimisation base de données", date: "2025-11-26", category: "optimisation" },
  { id: 16, type: "depense", amount: 5800, description: "Licences logiciels développement", date: "2025-11-25", category: "licence" },
  { id: 17, type: "recette", amount: 65000, description: "Développement CRM sur mesure", date: "2025-11-24", category: "service" },
  { id: 18, type: "depense", amount: 8900, description: "Matériel réseau et sécurité", date: "2025-11-23", category: "materiel" },
  { id: 19, type: "recette", amount: 29000, description: "Support technique mensuel", date: "2025-11-22", category: "support" },
  { id: 20, type: "depense", amount: 6500, description: "Assurance professionnelle", date: "2025-11-21", category: "assurance" },

  // Octobre 2025
  { id: 21, type: "recette", amount: 92000, description: "Refonte complète site web", date: "2025-10-31", category: "service" },
  { id: 22, type: "depense", amount: 13500, description: "Achat serveur dédié", date: "2025-10-30", category: "materiel" },
  { id: 23, type: "recette", amount: 48000, description: "Migration cloud infrastructure", date: "2025-10-29", category: "migration" },
  { id: 24, type: "depense", amount: 7800, description: "Frais juridiques et comptables", date: "2025-10-28", category: "juridique" },
  { id: 25, type: "recette", amount: 36000, description: "Développement module e-learning", date: "2025-10-27", category: "service" },
  { id: 26, type: "depense", amount: 5200, description: "Électricité et charges bureau", date: "2025-10-26", category: "charges" },
  { id: 27, type: "recette", amount: 58000, description: "Intégration système ERP", date: "2025-10-25", category: "integration" },
  { id: 28, type: "depense", amount: 9200, description: "Équipement bureau et mobilier", date: "2025-10-24", category: "mobilier" },
  { id: 29, type: "recette", amount: 31000, description: "Formation WordPress avancée", date: "2025-10-23", category: "formation" },
  { id: 30, type: "depense", amount: 6800, description: "Télécommunications et internet", date: "2025-10-22", category: "telecom" },

  // Septembre 2025
  { id: 31, type: "recette", amount: 78000, description: "Développement application métier", date: "2025-09-30", category: "service" },
  { id: 32, type: "depense", amount: 10500, description: "Participation salon professionnel", date: "2025-09-29", category: "evenement" },
  { id: 33, type: "recette", amount: 44000, description: "Audit performance web", date: "2025-09-28", category: "audit" },
  { id: 34, type: "depense", amount: 7600, description: "Outils de développement premium", date: "2025-09-27", category: "outils" },
  { id: 35, type: "recette", amount: 39000, description: "Maintenance préventive systèmes", date: "2025-09-26", category: "maintenance" },
  { id: 36, type: "depense", amount: 5900, description: "Frais de mission et déplacements", date: "2025-09-25", category: "mission" },
  { id: 37, type: "recette", amount: 67000, description: "Création plateforme e-commerce", date: "2025-09-24", category: "service" },
  { id: 38, type: "depense", amount: 8400, description: "Backup et sauvegarde données", date: "2025-09-23", category: "backup" },
  { id: 39, type: "recette", amount: 33000, description: "Optimisation SEO avancée", date: "2025-09-22", category: "seo" },
  { id: 40, type: "depense", amount: 6200, description: "Certification professionnelle", date: "2025-09-21", category: "certification" },

  // Août 2025
  { id: 41, type: "recette", amount: 56000, description: "Développement API REST", date: "2025-08-31", category: "api" },
  { id: 42, type: "depense", amount: 9800, description: "Congés payés équipe", date: "2025-08-30", category: "salaire" },
  { id: 43, type: "recette", amount: 41000, description: "Formation sécurité informatique", date: "2025-08-29", category: "formation" },
  { id: 44, type: "depense", amount: 7100, description: "Maintenance matériel informatique", date: "2025-08-28", category: "maintenance" },
  { id: 45, type: "recette", amount: 35000, description: "Conseil stratégie digitale", date: "2025-08-27", category: "conseil" },
  { id: 46, type: "depense", amount: 5600, description: "Abonnements cloud services", date: "2025-08-26", category: "cloud" },
  { id: 47, type: "recette", amount: 62000, description: "Développement dashboard analytics", date: "2025-08-25", category: "service" },
  { id: 48, type: "depense", amount: 8700, description: "Équipement sécurité réseau", date: "2025-08-24", category: "securite" },
  { id: 49, type: "recette", amount: 28000, description: "Support technique premium", date: "2025-08-23", category: "support" },
  { id: 50, type: "depense", amount: 6400, description: "Frais de représentation clients", date: "2025-08-22", category: "representation" },

  // Juillet 2025
  { id: 51, type: "recette", amount: 73000, description: "Refonte architecture microservices", date: "2025-07-31", category: "architecture" },
  { id: 52, type: "depense", amount: 11200, description: "Recrutement développeur senior", date: "2025-07-30", category: "recrutement" },
  { id: 53, type: "recette", amount: 46000, description: "Intégration système CRM", date: "2025-07-29", category: "integration" },
  { id: 54, type: "depense", amount: 7900, description: "Formation continue équipe", date: "2025-07-28", category: "formation" },
  { id: 55, type: "recette", amount: 37000, description: "Développement module reporting", date: "2025-07-27", category: "reporting" },
  { id: 56, type: "depense", amount: 5800, description: "Licences antivirus entreprise", date: "2025-07-26", category: "securite" },
  { id: 57, type: "recette", amount: 59000, description: "Migration données legacy", date: "2025-07-25", category: "migration" },
  { id: 58, type: "depense", amount: 8600, description: "Amélioration infrastructure", date: "2025-07-24", category: "infrastructure" },
  { id: 59, type: "recette", amount: 32000, description: "Audit code et qualité", date: "2025-07-23", category: "audit" },
  { id: 60, type: "depense", amount: 6700, description: "Outils monitoring performance", date: "2025-07-22", category: "monitoring" },

  // Juin 2025
  { id: 61, type: "recette", amount: 81000, description: "Développement plateforme SaaS", date: "2025-06-30", category: "saas" },
  { id: 62, type: "depense", amount: 12800, description: "Investissement R&D innovation", date: "2025-06-29", category: "rd" },
  { id: 63, type: "recette", amount: 49000, description: "Conseil transformation digitale", date: "2025-06-28", category: "conseil" },
  { id: 64, type: "depense", amount: 8200, description: "Formation intelligence artificielle", date: "2025-06-27", category: "ia" },
  { id: 65, type: "recette", amount: 38000, description: "Développement chatbot IA", date: "2025-06-26", category: "ia" },
  { id: 66, type: "depense", amount: 6100, description: "Certification cloud AWS", date: "2025-06-25", category: "certification" },
  { id: 67, type: "recette", amount: 64000, description: "Intégration blockchain", date: "2025-06-24", category: "blockchain" },
  { id: 68, type: "depense", amount: 9100, description: "Équipement développement mobile", date: "2025-06-23", category: "mobile" },
  { id: 69, type: "recette", amount: 34000, description: "Optimisation DevOps pipeline", date: "2025-06-22", category: "devops" },
  { id: 70, type: "depense", amount: 7000, description: "Abonnements outils collaboration", date: "2025-06-21", category: "collaboration" },

  // Mai 2025
  { id: 71, type: "recette", amount: 76000, description: "Développement marketplace", date: "2025-05-31", category: "marketplace" },
  { id: 72, type: "depense", amount: 10900, description: "Campagne marketing digital", date: "2025-05-30", category: "marketing" },
  { id: 73, type: "recette", amount: 43000, description: "Formation cybersécurité", date: "2025-05-29", category: "cybersecurite" },
  { id: 74, type: "depense", amount: 7500, description: "Mise à jour infrastructure", date: "2025-05-28", category: "infrastructure" },
  { id: 75, type: "recette", amount: 36000, description: "Développement PWA", date: "2025-05-27", category: "pwa" },
  { id: 76, type: "depense", amount: 5700, description: "Outils analytics avancés", date: "2025-05-26", category: "analytics" },
  { id: 77, type: "recette", amount: 61000, description: "Intégration IoT industriel", date: "2025-05-25", category: "iot" },
  { id: 78, type: "depense", amount: 8800, description: "Formation machine learning", date: "2025-05-24", category: "ml" },
  { id: 79, type: "recette", amount: 31000, description: "Audit sécurité RGPD", date: "2025-05-23", category: "rgpd" },
  { id: 80, type: "depense", amount: 6300, description: "Licences développement", date: "2025-05-22", category: "licence" },

  // Avril 2025
  { id: 81, type: "recette", amount: 68000, description: "Développement solution fintech", date: "2025-04-30", category: "fintech" },
  { id: 82, type: "depense", amount: 9600, description: "Participation conférence tech", date: "2025-04-29", category: "conference" },
  { id: 83, type: "recette", amount: 45000, description: "Conseil architecture cloud", date: "2025-04-28", category: "cloud" },
  { id: 84, type: "depense", amount: 7300, description: "Outils CI/CD avancés", date: "2025-04-27", category: "cicd" },
  { id: 85, type: "recette", amount: 39000, description: "Développement API GraphQL", date: "2025-04-26", category: "graphql" },
  { id: 86, type: "depense", amount: 5900, description: "Formation containerisation", date: "2025-04-25", category: "container" },
  { id: 87, type: "recette", amount: 57000, description: "Migration vers microservices", date: "2025-04-24", category: "microservices" },
  { id: 88, type: "depense", amount: 8500, description: "Équipement test automatisé", date: "2025-04-23", category: "test" },
  { id: 89, type: "recette", amount: 33000, description: "Optimisation performance DB", date: "2025-04-22", category: "database" },
  { id: 90, type: "depense", amount: 6600, description: "Abonnements monitoring", date: "2025-04-21", category: "monitoring" },

  // Mars 2025
  { id: 91, type: "recette", amount: 72000, description: "Développement solution e-health", date: "2025-03-31", category: "ehealth" },
  { id: 92, type: "depense", amount: 10200, description: "Certification sécurité ISO", date: "2025-03-30", category: "certification" },
  { id: 93, type: "recette", amount: 47000, description: "Conseil transformation agile" },
  { id: 93, type: "recette", amount: 47000, description: "Conseil transformation agile", date: "2025-03-29", category: "agile" },
  { id: 94, type: "depense", amount: 7700, description: "Formation Scrum Master", date: "2025-03-28", category: "formation" },
  { id: 95, type: "recette", amount: 40000, description: "Développement solution RH", date: "2025-03-27", category: "rh" },
  { id: 96, type: "depense", amount: 6000, description: "Outils gestion projet", date: "2025-03-26", category: "gestion" },
  { id: 97, type: "recette", amount: 54000, description: "Intégration système paie", date: "2025-03-25", category: "paie" },
  { id: 98, type: "depense", amount: 8300, description: "Équipement télétravail", date: "2025-03-24", category: "teletravail" },
  { id: 99, type: "recette", amount: 35000, description: "Audit conformité GDPR", date: "2025-03-23", category: "gdpr" },
  { id: 100, type: "depense", amount: 6800, description: "Assurance cyber-risques", date: "2025-03-22", category: "assurance" },

  // Février 2025
  { id: 101, type: "recette", amount: 69000, description: "Développement solution EdTech", date: "2025-02-29", category: "edtech" },
  { id: 102, type: "depense", amount: 9400, description: "Formation développement mobile", date: "2025-02-28", category: "mobile" },
  { id: 103, type: "recette", amount: 44000, description: "Conseil stratégie data", date: "2025-02-27", category: "data" },
  { id: 104, type: "depense", amount: 7200, description: "Licences BI et analytics", date: "2025-02-26", category: "bi" },
  { id: 105, type: "recette", amount: 38000, description: "Développement dashboard KPI", date: "2025-02-25", category: "kpi" },
  { id: 106, type: "depense", amount: 5800, description: "Formation data science", date: "2025-02-24", category: "datascience" },
  { id: 107, type: "recette", amount: 56000, description: "Migration cloud hybride", date: "2025-02-23", category: "cloud" },
  { id: 108, type: "depense", amount: 8100, description: "Équipement serveur backup", date: "2025-02-22", category: "backup" },
  { id: 109, type: "recette", amount: 32000, description: "Optimisation workflow", date: "2025-02-21", category: "workflow" },
  { id: 110, type: "depense", amount: 6500, description: "Outils automatisation", date: "2025-02-20", category: "automatisation" },

  // Janvier 2025
  { id: 111, type: "recette", amount: 74000, description: "Développement solution logistique", date: "2025-01-31", category: "logistique" },
  { id: 112, type: "depense", amount: 10600, description: "Prime début d'année équipe", date: "2025-01-30", category: "prime" },
  { id: 113, type: "recette", amount: 48000, description: "Conseil optimisation supply chain", date: "2025-01-29", category: "supply" },
  { id: 114, type: "depense", amount: 7800, description: "Formation lean management", date: "2025-01-28", category: "lean" },
  { id: 115, type: "recette", amount: 41000, description: "Développement tracking GPS", date: "2025-01-27", category: "gps" },
  { id: 116, type: "depense", amount: 6200, description: "Certification qualité ISO", date: "2025-01-26", category: "iso" },
  { id: 117, type: "recette", amount: 63000, description: "Intégration WMS avancé", date: "2025-01-25", category: "wms" },
  { id: 118, type: "depense", amount: 8900, description: "Équipement entrepôt connecté", date: "2025-01-24", category: "entrepot" },
  { id: 119, type: "recette", amount: 36000, description: "Formation gestion stocks", date: "2025-01-23", category: "stocks" },
  { id: 120, type: "depense", amount: 7100, description: "Outils prédictifs maintenance", date: "2025-01-22", category: "predictif" },
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"recettes" | "depenses">("recettes")
  const [filterPeriod, setFilterPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("jour")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "calendar">("day")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Fonction pour filtrer les transactions selon la période
  const getFilteredTransactions = useMemo(() => {
    const selectedDateObj = selectedDate

    return transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.date as string)

      if (isNaN(transactionDate.getTime())) return false

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
    const recettes = filtered.filter((t) => t.type === "recette").reduce((sum, t) => sum + t.amount, 0)
    const depenses = filtered.filter((t) => t.type === "depense").reduce((sum, t) => sum + t.amount, 0)
    const benefice = recettes - depenses

    return { recettes, depenses, benefice }
  }, [getFilteredTransactions])

  // Transactions filtrées par type actif
  const displayedTransactions = useMemo(() => {
    return getFilteredTransactions.filter((t) =>
      activeTab === "recettes" ? t.type === "recette" : t.type === "depense",
    )
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

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nouvelle dépense:", newExpense)
    setIsSheetOpen(false)
    setNewExpense({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="py-5">
      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
          {/* Navigation de date */}
          <div className="flex items-center mb-2 md:mb-0">
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
            <div className="flex overflow-x-auto space-x-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-4">
              <Card className="min-w-[260px] bg-[#FDE7A8] border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
                <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Recettes</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">
                        {totals.recettes.toLocaleString()} <span className="text-sm sm:text-lg text-gray-600">Fcfa</span>
                      </p>
                    </div>
                    <div className="bg-amber-500 p-2 sm:p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[260px] bg-[#FDDAA8] border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
                <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Dépenses</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">
                        {totals.depenses.toLocaleString()} <span className="text-sm sm:text-lg text-gray-600">Fcfa</span>
                      </p>
                    </div>
                    <div className="bg-amber-500 p-2 sm:p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingDown className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`min-w-[260px] bg-[#e8fcf0] border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative`}>
                <div className={`absolute inset-0 ${totals.benefice >= 0 ? "bg-amber-50" : "bg-red-50"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Bénéfice</p>
                      <p className={`text-xl sm:text-2xl font-bold ${totals.benefice >= 0 ? "text-gray-800" : "text-red-600"}`}>
                        {totals.benefice.toLocaleString()} <span className="text-sm sm:text-lg text-gray-600">Fcfa</span>
                      </p>
                    </div>
                    <div className={`${totals.benefice >= 0 ? "bg-amber-500" : "bg-red-500"} p-2 sm:p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex w-full sm:w-auto bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg">
                <Button
                  variant={activeTab === "recettes" ? "default" : "ghost"}
                  onClick={() => setActiveTab("recettes")}
                  className={`flex-1 sm:flex-none rounded-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${activeTab === "recettes"
                      ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  💰 Recettes
                </Button>
                <Button
                  variant={activeTab === "depenses" ? "default" : "ghost"}
                  onClick={() => setActiveTab("depenses")}
                  className={`flex-1 sm:flex-none rounded-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${activeTab === "depenses"
                      ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  💸 Dépenses
                </Button>
              </div>
            </div>

            {/* Tableau des transactions */}
            <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 bg-amber-50">
                      <TableHead className="font-bold text-gray-700 py-3 px-4 sm:py-4 sm:px-6">
                        {activeTab === "recettes" ? "💰 Entrée" : "💸 Sortie"}
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 py-3 px-4 sm:py-4 sm:px-6">
                        📝 Description
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
                          <TableCell className="py-3 px-4 sm:py-4 sm:px-6 text-gray-700 text-sm sm:text-base">
                            {transaction.description}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-8 sm:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <CalendarIcon className="h-8 sm:h-12 w-8 sm:w-12 text-gray-300" />
                            <p className="text-base sm:text-lg font-medium">Aucune transaction pour cette période</p>
                            <p className="text-xs sm:text-sm">Changez la période ou ajoutez une nouvelle transaction</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bouton d'ajout - affiché seulement pour les dépenses */}
            {activeTab === "depenses" && (
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
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <SheetTitle className="text-xl sm:text-2xl font-bold text-gray-800">Nouvelle Dépense</SheetTitle>
                    </div>
                    <SheetDescription className="text-gray-600 text-sm sm:text-base">
                      Ajoutez une nouvelle dépense à votre budget
                    </SheetDescription>
                  </SheetHeader>

                  <form onSubmit={handleSubmitExpense} className="space-y-4 sm:space-y-6 px-3">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Montant (Fcfa)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Ex: 5000"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs sm:text-sm font-semibold text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Ex: Achat de fournitures de bureau"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300 min-h-[80px] sm:min-h-[100px]"
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
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex-1 rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Ajouter la dépense
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
