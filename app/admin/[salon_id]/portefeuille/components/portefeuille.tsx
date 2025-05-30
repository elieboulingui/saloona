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
import { ChevronLeft, ChevronRight, Plus, Wallet, ArrowDownLeft, CreditCard, Phone } from "lucide-react"

// Données d'exemple pour le portefeuille
interface Transaction {
  id: number
  type: "entree" | "retrait"
  amount: number
  phone: string
  date: string
  description: string
}
interface BoutiqueAdminPageClientProps {
  salonId: string
}

export default function PortefeuillePage({salonId}: BoutiqueAdminPageClientProps) {
  const [activeTab, setActiveTab] = useState<"entrees" | "retraits">("entrees")
  const [filterPeriod, setFilterPeriod] = useState<"jour" | "semaine" | "mois" | "annee">("jour")
  const [selectedDate, setSelectedDate] = useState(new Date("2024-05-27"))
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`/api/portefeuille?id=${salonId}`)
        const data = await response.json()
  
        if (data && data.transactions) {
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du portefeuille :", error)
      }
    }
  
    fetchTransactions()
  }, [salonId])
  const [newWithdrawal, setNewWithdrawal] = useState({
    amount: "",
    phone: "",
    description: "",
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

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= filterDate && transactionDate <= now
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

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici vous pouvez ajouter la logique pour sauvegarder le retrait
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

        {/* Navigation de date */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-6 sm:py-4 shadow-lg border border-amber-200">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Solde Actuel</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {totals.soldeActuel.toLocaleString()} <span className="text-xs sm:text-lg text-gray-600">Fcfa</span>
                  </p>
                </div>
                <div className="bg-amber-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Retraits</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {totals.retraits.toLocaleString()} <span className="text-xs sm:text-lg text-gray-600">Fcfa</span>
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
              className={`rounded-lg sm:rounded-xl px-4 py-2 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-300 ${
                activeTab === "entrees"
                  ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              💰 Entrée
            </Button>
            <Button
              variant={activeTab === "retraits" ? "default" : "ghost"}
              onClick={() => setActiveTab("retraits")}
              className={`rounded-lg sm:rounded-xl px-4 py-2 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-300 ${
                activeTab === "retraits"
                  ? "bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              💸 Retrait
            </Button>
          </div>

          {/* Bouton d'ajout - affiché seulement pour les retraits */}
          {activeTab === "retraits" && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 w-10 h-10 sm:w-14 sm:h-14"
                >
                  <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
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
                        {transaction.amount.toLocaleString()} <span className="text-xs sm:text-sm text-gray-600">Fcfa</span>
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
                        <p className="text-xs sm:text-sm">Changez la période ou effectuez une nouvelle transaction</p>
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
