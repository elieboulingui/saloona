import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string}> }
  ) {
  try {
  
    const { id : organizationId } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }


    // Récupérer les départements de l'organisation
    const departments = await prisma.organizationDepartment.findMany({
      where: {
        organisationId: organizationId,
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


export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string}> }
) {
try {

    const { id : organizationId } = await params
    const { departmentIds } = await req.json()

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return NextResponse.json({ error: "Aucun département fourni" }, { status: 400 })
    }

    // Supprimer les anciens liens
    await prisma.organizationDepartment.deleteMany({
      where: { organisationId: organizationId }
    })

    // Créer les nouveaux liens
    const created = await Promise.all(
      departmentIds.map((depId: string) =>
        prisma.organizationDepartment.create({
          data: {
            organisationId: organizationId,
            departmentId: depId,
          },
          include: {
            department: true, // pour récupérer label, icon, etc.
          }
        })
      )
    )

    revalidatePath(`/admin/${organizationId}/services/departments`)

    return NextResponse.json(created)
  } catch (error) {
    console.error("[ORGANIZATION_DEPARTMENTS_POST]", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'ajout des départements" },
      { status: 500 }
    )
  }
}

