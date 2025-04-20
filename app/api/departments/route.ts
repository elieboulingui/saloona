import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

// GET /api/organizations/[id]/departments - Get all departments for an organization
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = params.id

    // Vérifier si l'utilisateur est membre de l'organisation
    const userMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    })

    if (!userMembership) {
      return NextResponse.json({ error: "Accès non autorisé à cette organisation" }, { status: 403 })
    }

    // Récupérer tous les départements de l'organisation
    const departments = await prisma.department.findMany({
      orderBy: {
        label : "asc"
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des départements" },
      { status: 500 },
    )
  }
}

// POST /api/organizations/[id]/departments - Create a new department for an organization
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image } = body

    // Validation des données
    if (!name) {
      return NextResponse.json({ error: "Le nom du département est requis" }, { status: 400 })
    }

    // Créer le département
    const department = await prisma.department.create({
      data: {
       label: name,
       icon : image
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("Erreur lors de la création du département:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du département" }, { status: 500 })
  }
}
