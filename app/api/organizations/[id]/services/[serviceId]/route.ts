import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

// GET /api/organizations/[id]/services/[serviceId] - Get a specific service
export async function GET(request: Request,
  { params }: { params: Promise<{ id: string , serviceId : string}> }
) {
  try {

    const {id  : organizationId , serviceId} = await params


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

    // Récupérer le service
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
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

// PATCH /api/organizations/[id]/services/[serviceId] - Update a service
export async function PATCH(request: Request,
  { params }: { params: Promise<{ id: string , serviceId : string}> }
) {
  try {

    const {id  : organizationId , serviceId} = await params

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
        { error: "Vous n'avez pas les droits pour modifier des services dans cette organisation" },
        { status: 403 },
      )
    }

    // Vérifier si le service existe et appartient à l'organisation
    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId,
        organizationId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (durationMin !== undefined) updateData.durationMin = Number(durationMin)
    if (durationMax !== undefined) updateData.durationMax = Number(durationMax)
    if (image !== undefined) updateData.image = image

    // Vérifier si le département existe et appartient à l'organisation
    if (departmentId) {
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

      updateData.department = { connect: { id: departmentId } }
    }

    // Mettre à jour le service
    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: updateData,
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
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du service" }, { status: 500 })
  }
}

// DELETE /api/organizations/[id]/services/[serviceId] - Delete a service
export async function DELETE(request: Request, 
  { params }: { params: Promise<{ id: string , serviceId : string}> }
){
  try {

    
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const {id  : organizationId , serviceId} = await params

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
        { error: "Vous n'avez pas les droits pour supprimer des services dans cette organisation" },
        { status: 403 },
      )
    }

    // Vérifier si le service existe et appartient à l'organisation
    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId,
        organizationId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
    }

    // Supprimer le service
    await prisma.service.delete({
      where: {
        id: serviceId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la suppression du service" }, { status: 500 })
  }
}
