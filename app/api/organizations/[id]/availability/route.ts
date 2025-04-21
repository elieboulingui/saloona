import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"


// GET: Récupérer les disponibilités d'une organisation
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id

    // Vérifier si l'utilisateur est membre de l'organisation
    const membership = await prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: "ADMIN",
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à accéder à cette organisation" }, { status: 403 })
    }

    // Récupérer les disponibilités
    const availability = await prisma.organizationAvailability.findUnique({
      where: {
        organizationId,
      },
    })

    // Si aucune disponibilité n'existe, créer une avec les valeurs par défaut
    if (!availability) {
      const newAvailability = await prisma.organizationAvailability.create({
        data: {
          organizationId,
        },
      })

      return NextResponse.json(newAvailability)
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des disponibilités" }, { status: 500 })
  }
}

// PATCH: Mettre à jour les disponibilités d'une organisation
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id
    const data = await request.json()

    // Vérifier si l'utilisateur est administrateur de l'organisation
    const membership = await prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: "ADMIN",
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier cette organisation" }, { status: 403 })
    }

    // Vérifier si les disponibilités existent déjà
    const existingAvailability = await prisma.organizationAvailability.findUnique({
      where: {
        organizationId,
      },
    })

    let availability

    if (existingAvailability) {
      // Mettre à jour les disponibilités existantes
      availability = await prisma.organizationAvailability.update({
        where: {
          id: existingAvailability.id,
        },
        data,
      })
    } else {
      // Créer de nouvelles disponibilités
      availability = await prisma.organizationAvailability.create({
        data: {
          ...data,
          organizationId,
        },
      })
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Erreur lors de la mise à jour des disponibilités:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour des disponibilités" }, { status: 500 })
  }
}
