import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer les organisations dont l'utilisateur est membre en utilisant UserOrganization
    const userOrganizations = await prisma.userOrganization.findMany({
      where: {
        userId,
      },
      include: {
        organization: {
          include: {
            departments: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    // Formater les données pour le frontend
    const organizations = userOrganizations.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      address: membership.organization.address,
      description: membership.organization.description,
      logoUrl: membership.organization.logo,
      departments: membership.organization.departments.map((od) => ({
        id: od.department.id,
        name: od.department.label,
      })),
    }))

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Erreur lors de la récupération des organisations:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des organisations" }, { status: 500 })
  }
}
