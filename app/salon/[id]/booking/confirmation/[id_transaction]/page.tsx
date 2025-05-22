import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, XCircle, Clock } from 'lucide-react'
import { prisma } from "@/utils/prisma"
import { ReceiptDownloadButton } from "./receipt-download-button"

export default async function BookingPage({ params }: { params: Promise<{ id_transaction: string, id : string }> }) {
  const { id_transaction , id :salonId} = await params

  // Récupérer la transaction et le rendez-vous associé
  const transaction = await prisma.transaction.findUnique({
    where: { id: id_transaction },
  })

  // Si la transaction n'existe pas
  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-lg">Transaction non trouvée</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  if (!transaction.appointmentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-lg">Rendez-vous non trouvée</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const { appointmentId, status, amount, createdAt } = transaction

  // Modifier la requête Prisma pour récupérer correctement les services avec leurs détails
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      services: {
        include: {
          service: true, // Inclure les détails complets du service
        },
      },
    },
  })

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-lg">Rendez-vous non trouvée</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const { orderNumber, estimatedTime, date, firstName } = appointment

  // Vérification des statuts de succès
  const isSuccess = status === "processed" || status === "paid"
  const isPending = status === "ready"
  const isFailed = ["failed", "expired", "cancelled"].includes(status)

  // Définition des couleurs et icônes selon le statut
  const statusColors = isSuccess ? "text-green-600" : isPending ? "text-yellow-500" : "text-red-600"
  const statusIcons = isSuccess ? (
    <CheckCircle className="h-8 w-8 text-green-500" />
  ) : isPending ? (
    <Clock className="h-8 w-8 text-yellow-500" />
  ) : (
    <XCircle className="h-8 w-8 text-red-500" />
  )
  const statusText = isSuccess ? "Succès" : isPending ? "En attente" : "Échoué"

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center container mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Confirmation</h1>
          </div>
          <div>{statusIcons}</div>
        </div>
      </header>

      <main className="flex-1 p-4 container mx-auto max-w-3xl">
        {/* Reçu de paiement */}
        <Card className="overflow-hidden border-none shadow-md mb-4 py-0">
          <div className="bg-amber-500 text-white p-4">
            <h2 className="text-lg font-bold">Reçu de paiement</h2>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Référence Ebilling:</span>
                <span className="font-medium">{transaction.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-medium">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date transaction:</span>
                <span className="font-medium">{new Date(createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Montant payé (acompte):</span>
                <span className="font-medium">{(amount+600).toLocaleString()} FCFA</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Méthode:</span>
                <span className="font-medium">Mobile Money</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut:</span>
                <span className={`${statusColors} font-medium`}>{statusText}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails du rendez-vous */}
        {appointment && (
          <Card className="overflow-hidden border-none shadow-md mb-6 py-0">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ordre de passage:</span>
                  <span className="font-medium">DIG-{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nom:</span>
                  <span className="font-medium">{firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Heure estimée:</span>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
                {/* Modifier l'affichage des services dans la carte des détails du rendez-vous */}
                <div className="flex justify-between">
                  <span className="text-gray-500">Services:</span>
                  <div className="text-right">
                    {appointment.services.map((appointmentService, index) => (
                      <div key={appointmentService.id} className="font-medium">
                        {appointmentService.service.name}
                        {index < appointment.services.length - 1 ? ", " : ""}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/** On fait passer les services */}
        {/* Modifier la façon dont nous passons les services au composant ReceiptDownloadButton */}
        <ReceiptDownloadButton 
          transaction={transaction} 
          appointment={appointment} 
          salonId={salonId}
          services={appointment.services.map(as => as.service)} 
        />
      </main>
    </div>
  )
}
