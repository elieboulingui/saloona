import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params
    
    const service = await prisma.service.findUnique({
      where: { id: id },
    })

    if (!service) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Erreur lors de la récupération du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération du service" }, { status: 500 })
  }
}

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params
    const { name, description, price, durationMin, durationMax, image } = await request.json()

    if (!name || !price || !durationMin || !durationMax) {
      return NextResponse.json({ error: "Les informations du service sont incomplètes ou invalides" }, { status: 400 })
    }

    const service = await prisma.service.update({
      where: { id: id },
      data: {
        name,
        description,
        price,
        durationMin,
        durationMax,
        image,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du service" }, { status: 500 })
  }
}

export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params
    // Vérifier si le service existe
    const service = await prisma.service.findUnique({
      where: { id: id },
      include: {
        appointments: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
    }

    // Vérifier si le service a des rendez-vous associés
    if (service.appointments.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un service qui a des rendez-vous associés" },
        { status: 400 },
      )
    }

    await prisma.service.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la suppression du service" }, { status: 500 })
  }
}

