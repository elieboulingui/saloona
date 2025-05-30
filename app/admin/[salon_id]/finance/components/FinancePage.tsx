"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
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
interface Transaction {
  id: number;
  type: 'recette' | 'depense';
  amount: number;
  description: string;
  date: string;
  category: string;
}
interface finance {
  salonId : string
}


export default function FinancePage({  salonId}: finance) {
  const [activeTab, setActiveTab] = useState<"recettes" | "depenses">("recettes")
  const [filterPeriod, setFilterPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("jour")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); // facultatif
  const [error, setError] = useState(null); // facultatif
  const [viewMode, setViewMode] = useState<"day" | "calendar">("day")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`api/financialmanagement?id=${salonId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const data = await response.json();
        setTransactionsData(data);
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);
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