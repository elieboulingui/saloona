// Service Worker pour les notifications push

// Événement d'installation du service worker
self.addEventListener("install", (event) => {
    console.log("Service Worker installé")
    self.skipWaiting()
  })
  
  // Événement d'activation du service worker
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activé")
    return self.clients.claim()
  })
  
  // Gestion des notifications push
  self.addEventListener("push", (event) => {
    if (!event.data) {
      console.log("Notification push reçue sans données")
      return
    }
  
    try {
      const data = event.data.json()
      console.log("Notification push reçue:", data)
  
      const options = {
        body: data.message,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: data.data,
        actions: [
          {
            action: "view",
            title: "Voir les détails",
          },
          {
            action: "close",
            title: "Fermer",
          },
        ],
        vibrate: [100, 50, 100],
        tag: data.notificationId || "default",
        renotify: true,
      }
  
      event.waitUntil(self.registration.showNotification(data.title, options))
    } catch (error) {
      console.error("Erreur lors du traitement de la notification push:", error)
    }
  })
  
  // Gestion des clics sur les notifications
  self.addEventListener("notificationclick", (event) => {
    event.notification.close()
  
    if (event.action === "close") {
      return
    }
  
    // Ouvrir l'application sur la page appropriée
    const urlToOpen =
      event.notification.data && event.notification.data.appointmentId
        ? `/admin/calendar?appointmentId=${event.notification.data.appointmentId}`
        : "/admin"
  
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (const client of windowClients) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus()
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
    )
  })
  