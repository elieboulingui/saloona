"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si l'application est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher Chrome 67+ d'afficher automatiquement la fenêtre d'installation
      e.preventDefault()
      // Stocker l'événement pour pouvoir le déclencher plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Afficher notre propre bouton d'installation
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Afficher la fenêtre d'installation
    await deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const choiceResult = await deferredPrompt.userChoice

    // Réinitialiser l'événement deferredPrompt
    setDeferredPrompt(null)

    if (choiceResult.outcome === "accepted") {
      console.log("L'utilisateur a accepté l'installation")
    } else {
      console.log("L'utilisateur a refusé l'installation")
    }

    // Masquer le prompt dans tous les cas
    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 border-t">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-sm">Installer l'application</h3>
          <p className="text-xs text-gray-600">Accédez rapidement à Dread In Gabon depuis votre écran d'accueil</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={dismissPrompt} className="p-1">
            <X className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleInstallClick} className="bg-amber-500 hover:bg-amber-600">
            <Download className="h-4 w-4 mr-1" />
            Installer
          </Button>
        </div>
      </div>
    </div>
  )
}

