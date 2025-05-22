"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NotificationButton() {

  const [permission, setPermission] = useState<NotificationPermission | "default">("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false)
      return
    }

    // Vérifier l'état actuel de la permission
    setPermission(Notification.permission)

    // Vérifier si l'utilisateur est déjà abonné
    checkSubscriptionStatus()
  }, [])

  // Vérifier si l'utilisateur est déjà abonné aux notifications
  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error)
    }
  }

  // Demander la permission et s'abonner aux notifications
  const subscribeToNotifications = async () => {
    setIsLoading(true)
    try {
      // Demander la permission si nécessaire
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission()
        setPermission(permission)
        if (permission !== "granted") {
          toast( "Permission refusée" , {
            description: "Vous devez autoriser les notifications dans les paramètres de votre navigateur.",
          })
          setIsLoading(false)
          return
        }
      }

      // Enregistrer le service worker s'il n'est pas déjà enregistré
      const registration = await navigator.serviceWorker.ready

      // Récupérer la clé publique VAPID
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        throw new Error("Clé publique VAPID manquante")
      }

      // Convertir la clé publique en Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // S'abonner aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      // Envoyer l'abonnement au serveur
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de l'abonnement")
      }

      setIsSubscribed(true)
      toast( "Notifications activées",{
        description: "Vous recevrez désormais des notifications pour les nouvelles réservations.",
      })
    } catch (error) {
      console.error("Erreur lors de l'abonnement aux notifications:", error)
      toast("Erreur", {
        description: "Une erreur est survenue lors de l'activation des notifications.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Se désabonner des notifications
  const unsubscribeFromNotifications = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
      }

      // Informer le serveur du désabonnement
      const response = await fetch("/api/notifications/subscribe", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors du désabonnement")
      }

      setIsSubscribed(false)
      toast("Notifications désactivées",{
        description: "Vous ne recevrez plus de notifications pour les nouvelles réservations.",
      })
    } catch (error) {
      console.error("Erreur lors du désabonnement aux notifications:", error)
      toast("Erreur",{
        description: "Une erreur est survenue lors de la désactivation des notifications.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Si les notifications ne sont pas supportées
  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      className={isSubscribed ? "border-green-500 text-green-500" : "bg-amber-500 hover:bg-amber-600"}
      onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
        </>
      )}
    </Button>
  )
}

// Fonction utilitaire pour convertir une chaîne base64 URL en Uint8Array
// Nécessaire pour l'applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
