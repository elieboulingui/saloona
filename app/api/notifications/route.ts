import { NextResponse } from "next/server"
import { auth } from "@/auth"
import webpush from "web-push"
import { prisma } from "@/utils/prisma"

// Configuration des clés VAPID pour Web Push
const vapidKeys = {
  publicKey: "BNWiGTUJozjVWT3WJ1GzAbz74V9XGl_G3oFeiyxJcCO60L-F672BxqJ7IaPp4VAVE2LPpPKeptsfLzTRe2Zdnc8",
  privateKey: "TN6isMLosDI7pU-CZXUpt4H565brs_E29pTGgx5Vdas",
}

webpush.setVapidDetails("mailto:contact@dreadingabon.com", vapidKeys.publicKey, vapidKeys.privateKey)

// GET - Récupérer les notifications de l'utilisateur connecté
export async function GET() {
    
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des notifications" },
      { status: 500 },
    )
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, type, data, userIds } = body

    // Vérifier les permissions
    const session = await auth()
    if (!session?.user?.id || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Si userIds est fourni, envoyer la notification à ces utilisateurs spécifiques
    // Sinon, envoyer à tous les administrateurs
    const targetUsers = userIds
      ? await prisma.user.findMany({
          where: {
            id: { in: userIds },
            notificationsEnabled: true,
          },
        })
      : await prisma.user.findMany({
          where: {
            role: { in: ["ADMIN", "BARBER"] },
            notificationsEnabled: true,
          },
        })

    // Créer les notifications en base de données
    const notifications = await Promise.all(
      targetUsers.map(async (user) => {
        return prisma.notification.create({
          data: {
            title,
            message,
            type,
            data: data ? JSON.stringify(data) : null,
            userId: user.id,
          },
        })
      }),
    )

    // Envoyer les notifications push aux utilisateurs qui ont un pushSubscription
    await Promise.all(
      targetUsers
        .filter((user) => user.pushSubscription)
        .map(async (user) => {
          try {
            const subscription = JSON.parse(user.pushSubscription!)
            const payload = JSON.stringify({
              title,
              message,
              type,
              data,
              notificationId: notifications.find((n) => n.userId === user.id)?.id,
            })

            await webpush.sendNotification(subscription, payload)
          } catch (error) {
            console.error(`Erreur lors de l'envoi de la notification push à l'utilisateur ${user.id}:`, error)
          }
        }),
    )

    return NextResponse.json({ success: true, count: notifications.length })
  } catch (error) {
    console.error("Erreur lors de la création des notifications:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création des notifications" },
      { status: 500 },
    )
  }
}
