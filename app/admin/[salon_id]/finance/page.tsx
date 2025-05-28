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
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Calendar,
  Receipt,
} from "lucide-react"

// Données d'exemple
const transactionsData = [
  { id: 1, type: "recette", amount: 15000, description: "Vente produit A", date: "2024-05-27", category: "vente" },
  { id: 2, type: "depense", amount: 5000, description: "Achat shampoo", date: "2024-05-27", category: "achat" },
  {
    id: 3,
    type: "recette",
    amount: 25000,
    description: "Service consultation",
    date: "2024-05-26",
    category: "service",
  },
  { id: 4, type: "depense", amount: 8000, description: "Transport", date: "2024-05-26", category: "transport" },
  { id: 5, type: "recette", amount: 12000, description: "Vente produit B", date: "2024-05-25", category: "vente" },
  { id: 6, type: "depense", amount: 3000, description: "Fournitures", date: "2024-05-25", category: "fourniture" },
  { id: 7, type: "recette", amount: 18000, description: "Formation", date: "2024-05-20", category: "formation" },
  { id: 8, type: "depense", amount: 7000, description: "Électricité", date: "2024-05-15", category: "facture" },
  { id: 9, type: "recette", amount: 22000, description: "Consultation", date: "2024-04-28", category: "service" },
  { id: 10, type: "depense", amount: 4500, description: "Internet", date: "2024-04-25", category: "facture" },
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"recettes" | "depenses">("recettes")
  const [filterPeriod, setFilterPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("jour")
  const [selectedDate, setSelectedDate] = useState(new Date("2024-05-27"))
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Fonction pour filtrer les transactions selon la période
  const getFilteredTransactions = useMemo(() => {
    const now = selectedDate
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    let filterDate: Date

    switch (filterPeriod) {
      case "jour":
        filterDate = startOfDay
        break
      case "semaine":
        filterDate = startOfWeek
        break
      case "mois":
        filterDate = startOfMonth
        break
      case "annee":
        filterDate = startOfYear
        break
      default:
        filterDate = startOfDay
    }

    return transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= filterDate && transactionDate <= now
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

  // Navigation des dates
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)

    switch (filterPeriod) {
      case "jour":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
        break
      case "semaine":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
        break
      case "mois":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
        break
      case "annee":
        newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1))
        break
    }

    setSelectedDate(newDate)
  }

  // Formatage de la date selon la période
  const formatDisplayDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    switch (filterPeriod) {
      case "jour":
        return selectedDate.toLocaleDateString("fr-FR", options)
      case "semaine":
        const endOfWeek = new Date(selectedDate)
        endOfWeek.setDate(selectedDate.getDate() + 6)
        return `Semaine du ${selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au ${endOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
      case "mois":
        return selectedDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
      case "annee":
        return selectedDate.getFullYear().toString()
      default:
        return selectedDate.toLocaleDateString("fr-FR", options)
    }
  }

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici vous pouvez ajouter la logique pour sauvegarder la dépense
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-amber-300 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-amber-100 rounded-full opacity-25 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* En-tête avec filtres */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-end">
          <div className="flex gap-3 w-full sm:w-auto">
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

        {/* Navigation de date */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border border-amber-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate("prev")}
            className="rounded-full hover:bg-amber-200 transition-all duration-300 hover:scale-110 hover:shadow-lg text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center flex flex-col sm:flex-row items-center gap-2">
            <span className="bg-amber-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Aujourd'hui
            </span>
            <span className="font-semibold text-gray-800 text-sm sm:text-base">{formatDisplayDate()}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate("next")}
            className="rounded-full hover:bg-amber-200 transition-all duration-300 hover:scale-110 hover:shadow-lg text-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
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

          <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative">
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

          <Card
            className={`bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden relative`}
          >
            <div
              className={`absolute inset-0 ${totals.benefice >= 0 ? "bg-amber-50" : "bg-red-50"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            ></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Bénéfice</p>
                  <p className={`text-xl sm:text-2xl font-bold ${totals.benefice >= 0 ? "text-gray-800" : "text-red-600"}`}>
                    {totals.benefice.toLocaleString()} <span className="text-sm sm:text-lg text-gray-600">Fcfa</span>
                  </p>
                </div>
                <div
                  className={`${totals.benefice >= 0 ? "bg-amber-500" : "bg-red-500"} p-2 sm:p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets et bouton d'ajout */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex bg-white border-gray-300 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg">
            <Button
              variant={activeTab === "recettes" ? "default" : "ghost"}
              onClick={() => setActiveTab("recettes")}
              className={`rounded-xl px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${activeTab === "recettes"
                  ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              💰 Recettes
            </Button>
            <Button
              variant={activeTab === "depenses" ? "default" : "ghost"}
              onClick={() => setActiveTab("depenses")}
              className={`rounded-xl px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${activeTab === "depenses"
                  ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              💸 Dépenses
            </Button>
          </div>

          {/* Bouton d'ajout - affiché seulement pour les dépenses */}
          {activeTab === "depenses" && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="sm:flex justify-end ">
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
                    <Label htmlFor="category" className="text-xs sm:text-sm font-semibold text-gray-700">
                      Catégorie
                    </Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger className="bg-white text-gray-700 border-gray-300 shadow-lg rounded-xl focus:shadow-xl focus:border-amber-500 transition-all duration-300">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 shadow-2xl rounded-xl">
                        <SelectItem value="achat" className="rounded-lg text-gray-700">
                          🛒 Achat
                        </SelectItem>
                        <SelectItem value="transport" className="rounded-lg text-gray-700">
                          🚗 Transport
                        </SelectItem>
                        <SelectItem value="fourniture" className="rounded-lg text-gray-700">
                          📝 Fournitures
                        </SelectItem>
                        <SelectItem value="facture" className="rounded-lg text-gray-700">
                          📄 Factures
                        </SelectItem>
                        <SelectItem value="autre" className="rounded-lg text-gray-700">
                          📦 Autre
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                      className="flex-1 rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      Ajouter la dépense
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          )}
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
                  <TableHead className="font-bold text-gray-700 py-3 px-4 sm:py-4 sm:px-6">📝 Description</TableHead>
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
                        {transaction.amount.toLocaleString()} <span className="text-xs sm:text-sm text-gray-600">Fcfa</span>
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
                        <Calendar className="h-8 sm:h-12 w-8 sm:w-12 text-gray-300" />
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