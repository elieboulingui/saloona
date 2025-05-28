"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Download, Upload, Search, ArrowUpDown } from "lucide-react"

// Types pour les transactions
type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment'
  status: 'completed' | 'pending' | 'failed'
}

export default function PortefeuillePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2023-11-15",
      description: "Paiement client - Coupe de cheveux",
      amount: 5000,
      type: "deposit",
      status: "completed",
    },
    {
      id: "2",
      date: "2023-11-14",
      description: "Achat de produits coiffure",
      amount: -25000,
      type: "withdrawal",
      status: "completed",
    },
    {
      id: "3",
      date: "2023-11-10",
      description: "Abonnement mensuel",
      amount: -15000,
      type: "withdrawal",
      status: "pending",
    },
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Terminé</Badge>
      case 'pending':
        return <Badge variant="outline">En attente</Badge>
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpDown className="h-4 w-4 text-green-500 rotate-90" />
      case 'withdrawal':
        return <ArrowUpDown className="h-4 w-4 text-red-500 -rotate-90" />
      case 'transfer':
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille</h1>
          <p className="text-muted-foreground">
            Gérez vos transactions et votre solde
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="transfer">Virement</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">₣</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(100000)}</div>
                <p className="text-xs text-muted-foreground">
                  +5% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">↗️</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(450000)}</div>
                <p className="text-xs text-muted-foreground">
                  +12% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses du mois</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">↘️</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(125000)}</div>
                <p className="text-xs text-muted-foreground">
                  +2% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos 5 dernières transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span>{transaction.description}</span>
                      </TableCell>
                      <TableCell className={transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Historique complet de vos transactions</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-8 w-[200px]"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="deposit">Dépôts</SelectItem>
                      <SelectItem value="withdrawal">Retraits</SelectItem>
                      <SelectItem value="transfer">Transferts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.type === 'deposit' ? 'Dépôt' : 
                         transaction.type === 'withdrawal' ? 'Retrait' : 'Transfert'}
                      </TableCell>
                      <TableCell className={transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Effectuer un virement</CardTitle>
              <CardDescription>
                Transférez de l'argent vers un autre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Bénéficiaire</Label>
                  <Input id="beneficiary" placeholder="Nom du bénéficiaire" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Numéro de compte</Label>
                  <Input id="account" placeholder="Numéro de compte IBAN" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant</Label>
                  <Input id="amount" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="XOF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xof">XOF</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input id="reference" placeholder="Référence optionnelle" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Input id="message" placeholder="Message pour le bénéficiaire" />
              </div>
              <div className="flex justify-end">
                <Button>Effectuer le virement</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du portefeuille</CardTitle>
              <CardDescription>
                Gérez les préférences et les paramètres de votre portefeuille
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Devise par défaut</h3>
                <div className="max-w-xs">
                  <Select defaultValue="xof">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xof">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                      <SelectItem value="usd">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cette devise sera utilisée par défaut pour toutes les transactions.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="email-notifications" className="h-4 w-4" defaultChecked />
                    <label htmlFor="email-notifications" className="text-sm font-medium leading-none">
                      Recevoir les notifications par email
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="push-notifications" className="h-4 w-4" defaultChecked />
                    <label htmlFor="push-notifications" className="text-sm font-medium leading-none">
                      Recevoir les notifications push
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive">Déconnecter mon compte bancaire</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Cela supprimera votre compte bancaire lié. Vous pourrez le reconnecter plus tard.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
