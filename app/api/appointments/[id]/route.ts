import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function PATCH(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    // Récupérer la session de l'utilisateur connecté
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Vous n'etes pas autorisé !" },
        { status: 403 },
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = { status }

    // Si le statut est INCHAIR et que l'utilisateur est connecté, mettre à jour le barberId
    if (status === "INCHAIR" && session?.user?.id) {
      updateData.barberId = session.user.id
    }

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/tv")

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du rendez-vous" },
      { status: 500 },
    )
  }
}

