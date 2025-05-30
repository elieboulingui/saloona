import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

// GET /api/organizations/[id]/services - Get all services for an organization
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    })

    if (!userMembership) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette organisation" },
        { status: 403 }
      )
    }

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
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des services" },
      { status: 500 }
    )
  }
}

// POST /api/organizations/[id]/services - Create a new service for an organization
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      durationMin,
      durationMax,
      image,
      department: departmentLabel,
    } = body

    // Vérifie si l'utilisateur est ADMIN dans l'organisation
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
        { status: 403 }
      )
    }

    if (!name || !price || !durationMin || !durationMax || !departmentLabel) {
      return NextResponse.json(
        { error: "Données manquantes pour créer un service" },
        { status: 400 }
      )
    }

    // 1. Trouver le département par label
    const department = await prisma.department.findFirst({
      where: {
        label: departmentLabel,
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: "Département introuvable" },
        { status: 404 }
      )
    }

    // 2. Vérifier l'association avec l'organisation
    const orgDept = await prisma.organizationDepartment.findFirst({
      where: {
        organisationId: organizationId,
        departmentId: department.id,
      },
    })

    if (!orgDept) {
      return NextResponse.json(
        { error: "Ce département n'est pas lié à cette organisation" },
        { status: 403 }
      )
    }

    // 3. Créer le service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: Number(price),
        durationMin: Number(durationMin),
        durationMax: Number(durationMax),
        image,
        department: {
          connect: { id: department.id },
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
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du service" },
      { status: 500 }
    )
  }
}
