import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"

// POST - S'abonner aux notifications push
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription) {
      return NextResponse.json({ error: "Données d'abonnement manquantes" }, { status: 400 })
    }

    // Mettre à jour l'utilisateur avec les informations d'abonnement
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationsEnabled: true,
        pushSubscription: JSON.stringify(subscription),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux notifications:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'abonnement aux notifications" },
      { status: 500 },
    )
  }
}

// DELETE - Se désabonner des notifications push
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Mettre à jour l'utilisateur pour désactiver les notifications
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationsEnabled: false,
        pushSubscription: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors du désabonnement aux notifications:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du désabonnement aux notifications" },
      { status: 500 },
    )
  }
}
