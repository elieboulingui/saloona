import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

// GET /api/organizations/[id]/services - Get all services for an organization
export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id  : organizationId } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

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

    // Récupérer tous les services de l'organisation
    const services = await prisma.service.findMany({
      where: {
        organizationId,
      },
      include: {
        department: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des services" }, { status: 500 })
  }
}

// POST /api/organizations/[id]/services - Create a new service for an organization
export async function POST(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id  : organizationId } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, durationMin, durationMax, image, departmentId } = body

    // Vérifier si l'utilisateur est administrateur de l'organisation
    const userMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: "ADMIN",
      },
    })

    if (!userMembership) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour créer des services dans cette organisation" },
        { status: 403 },
      )
    }

    // Validation des données
    if (!name || !price || !durationMin || !durationMax || !departmentId) {
      return NextResponse.json({ error: "Données manquantes pour créer un service" }, { status: 400 })
    }

    // Vérifier si le département existe et appartient à l'organisation
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: "Département non trouvé ou n'appartient pas à cette organisation" },
        { status: 404 },
      )
    }

    // Créer le service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: Number(price),
        durationMin: Number(durationMin),
        durationMax: Number(durationMax),
        image,
        department: {
          connect: { id: departmentId },
        },
        organization: {
          connect: { id: organizationId },
        },
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Erreur lors de la création du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du service" }, { status: 500 })
  }
}
