"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="bg-amber-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Vous êtes hors ligne</h1>
        <p className="text-gray-600 mb-6">
          Il semble que vous n'ayez pas de connexion internet. Certaines fonctionnalités peuvent ne pas être
          disponibles.
        </p>

        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full bg-amber-500 hover:bg-amber-600">
            Réessayer
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

