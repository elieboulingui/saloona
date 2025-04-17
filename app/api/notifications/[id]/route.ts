import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"

// PATCH - Marquer une notification comme lue
export async function PATCH(    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification non trouvée" }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Mettre à jour la notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la notification" },
      { status: 500 },
    )
  }
}

// DELETE - Supprimer une notification
export async function DELETE(    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification non trouvée" }, { status: 404 })
    }

    if (notification.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Supprimer la notification
    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la notification" },
      { status: 500 },
    )
  }
}
