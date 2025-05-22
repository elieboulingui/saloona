import { NextResponse } from "next/server"
import webpush from "web-push"

// Cette route est utilisée pour générer des clés VAPID pour les notifications push
// Elle ne doit être accessible qu'aux administrateurs et uniquement en développement
export async function GET() {
  try {

    // Vérifier que l'environnement est en développement
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Cette route n'est disponible qu'en développement" }, { status: 403 })
    }

    // Générer les clés VAPID
    const vapidKeys = webpush.generateVAPIDKeys()

    return NextResponse.json({
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
      instructions:
        "Ajoutez ces clés à vos variables d'environnement: NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY",
    })
  } catch (error) {
    console.error("Erreur lors de la génération des clés VAPID:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la génération des clés VAPID" }, { status: 500 })
  }
}
