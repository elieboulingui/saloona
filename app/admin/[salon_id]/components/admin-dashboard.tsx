"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WithdrawalDialog } from "./withdrawal-dialog"
import {
  Wallet,
  ArrowDownCircle,
  Loader2,
  RefreshCcw,
  Download,
  ChevronRight,
  Calendar,
  BarChart3,
  Users,
  ListOrdered,
  ArrowLeft,
  Home,
} from "lucide-react"
import { DateRangePicker } from "./date-range-picker"
import { TransactionItem } from "./transaction-item"
import { StatCard } from "./stat-card"
import { FinancialChart } from "./financial-chart"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserSheet } from "@/components/user-sheet"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AdminDashboardProps {
  salonId: string
}

export default function AdminDashboard({ salonId }: AdminDashboardProps) {

  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Construire l'URL de l'API avec les filtres
  const getApiUrl = () => {
    const url = `/api/organizations/${salonId}/data`
    const params = new URLSearchParams()

    if (dateRange?.from) {
      params.append("startDate", format(dateRange.from, "yyyy-MM-dd"))
    }
    if (dateRange?.to) {
      params.append("endDate", format(dateRange.to, "yyyy-MM-dd"))
    }
    if (typeFilter) {
      params.append("type", typeFilter)
    }
    if (statusFilter) {
      params.append("status", statusFilter)
    }

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  // Récupérer les données avec SWR
  const { data, error, isLoading, mutate } = useSWR(getApiUrl(), fetcher, {
    refreshInterval: 60000, // Rafraîchir toutes les minutes
    revalidateOnFocus: true,
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    mutate()
  }

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + " FCFA"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-amber-500" />
          </motion.div>
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center p-6 bg-red-50 rounded-xl max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
          >
            <Wallet className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">
            Une erreur est survenue lors du chargement des données. Veuillez réessayer.
          </p>
          <Button onClick={refreshData} className="bg-red-600 hover:bg-red-700 text-white">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const financialSummary = data?.financialSummary || {
    cashFlowTotal: 0,
    withdrawalsTotal: 0,
    currentBalance: 0,
  }

  const statistics = data?.statistics || {
    byType: {
      APPOINTMENT: { count: 0, amount: 0 },
      ORDER: { count: 0, amount: 0 },
      WITHDRAWAL: { count: 0, amount: 0 },
    },
    byStatus: {},
  }

  const transactions = data?.transactions || []

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <Home className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Administration</h1>
            <p className="text-white/80 text-xs">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <UserSheet salonId={salonId} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Date range and refresh */}
          <div className="flex justify-between items-center">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isOpen={isFilterOpen}
              onOpenChange={setIsFilterOpen}
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} className="bg-gray-100 p-2 rounded-full">
              <RefreshCcw className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Financial summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Solde actuel"
              value={formatAmount(financialSummary.currentBalance)}
              icon={<Wallet className="h-6 w-6 text-amber-600" />}
              bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
              textColor="text-amber-900"
              iconBgColor="bg-amber-500/20"
            />
            <StatCard
              title="Revenus"
              value={formatAmount(financialSummary.cashFlowTotal)}
              icon={<ArrowDownCircle className="h-6 w-6 text-green-600" />}
              bgColor="bg-gradient-to-br from-green-50 to-green-100"
              textColor="text-green-900"
              iconBgColor="bg-green-500/20"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
              >
                <Wallet className="h-4 w-4 mr-1" />
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Agenda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Financial chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Aperçu financier</h3>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    Ce mois
                  </Badge>
                </div>
                <FinancialChart salonId={salonId} />
              </motion.div>

              {/* Transaction summary */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Transactions récentes</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-600 hover:text-amber-700 p-0 h-auto"
                    onClick={() => setActiveTab("transactions")}
                  >
                    Voir tout
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {transactions.slice(0, 5).map((transaction: any, index: any) => (
                      <TransactionItem key={transaction.id} transaction={transaction} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Type statistics */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h3 className="font-bold text-gray-800">Statistiques par type</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 bg-blue-50 border-blue-200">
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-blue-700 mb-1">Rendez-vous</p>
                      <p className="text-lg font-bold text-blue-800">{statistics.byType.APPOINTMENT.count}</p>
                      <p className="text-xs text-blue-600 mt-1">{formatAmount(statistics.byType.APPOINTMENT.amount)}</p>
                    </div>
                  </Card>
                  <Card className="p-3 bg-green-50 border-green-200">
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-green-700 mb-1">Commandes</p>
                      <p className="text-lg font-bold text-green-800">{statistics.byType.ORDER.count}</p>
                      <p className="text-xs text-green-600 mt-1">{formatAmount(statistics.byType.ORDER.amount)}</p>
                    </div>
                  </Card>
                  <Card className="p-3 bg-red-50 border-red-200">
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-red-700 mb-1">Retraits</p>
                      <p className="text-lg font-bold text-red-800">{statistics.byType.WITHDRAWAL.count}</p>
                      <p className="text-xs text-red-600 mt-1">{formatAmount(statistics.byType.WITHDRAWAL.amount)}</p>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Toutes les transactions</h3>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => exportToCSV(transactions)}>
                    <Download className="h-3 w-3 mr-1" />
                    Exporter CSV
                  </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Badge
                    variant="outline"
                    className={`cursor-pointer whitespace-nowrap ${!typeFilter ? "bg-amber-100 text-amber-800" : ""}`}
                    onClick={() => setTypeFilter(null)}
                  >
                    Tous les types
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer whitespace-nowrap ${
                      typeFilter === "APPOINTMENT" ? "bg-blue-100 text-blue-800" : ""
                    }`}
                    onClick={() => setTypeFilter("APPOINTMENT")}
                  >
                    Rendez-vous
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer whitespace-nowrap ${
                      typeFilter === "ORDER" ? "bg-green-100 text-green-800" : ""
                    }`}
                    onClick={() => setTypeFilter("ORDER")}
                  >
                    Commandes
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer whitespace-nowrap ${
                      typeFilter === "WITHDRAWAL" ? "bg-red-100 text-red-800" : ""
                    }`}
                    onClick={() => setTypeFilter("WITHDRAWAL")}
                  >
                    Retraits
                  </Badge>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {transactions.map((transaction: any, index: any) => (
                      <TransactionItem key={transaction.id} transaction={transaction} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Rendez-vous à venir</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-600 hover:text-amber-700 p-0 h-auto"
                    onClick={() => (window.location.href = `/admin/${salonId}/calendar`)}
                  >
                    Calendrier complet
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-center text-gray-500 py-8">
                    Consultez le calendrier complet pour voir tous vos rendez-vous
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Withdrawal Dialog */}
      <WithdrawalDialog salonId={salonId} onSuccess={refreshData} />
    </div>
  )
}

// Fonction pour exporter les données en CSV
function exportToCSV(transactions: any[]) {
  if (!transactions || transactions.length === 0) return

  // Créer les en-têtes du CSV
  const headers = ["ID", "Type", "Montant", "Référence", "Description", "Statut", "Date"].join(",")

  // Créer les lignes du CSV
  const rows = transactions.map((transaction) =>
    [
      transaction.id,
      transaction.type,
      transaction.amount,
      transaction.reference,
      transaction.shortDescription,
      transaction.status,
      format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm:ss"),
    ].join(","),
  )

  // Combiner les en-têtes et les lignes
  const csv = [headers, ...rows].join("\n")

  // Créer un blob et un lien de téléchargement
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
