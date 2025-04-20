import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string, user_id : string }> }
) {
  try {

    const { id , user_id} = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = id
    const userId = user_id

    // Vérifier si l'utilisateur actuel est membre de l'organisation
    const currentUserMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    })

    if (!currentUserMembership) {
      return NextResponse.json({ error: "Accès non autorisé à cette organisation" }, { status: 403 })
    }

    // Récupérer les services de l'utilisateur dans cette organisation
    const services = await prisma.service.findMany({
      where: {
        organizationId,
        users: {
          some: {
            userId,
          },
        },
      },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des services" }, { status: 500 })
  }
}

export async function POST(request: Request,
  { params }: { params: Promise<{ id: string , user_id : string}> }
) {
try {

    const { id, user_id } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const organizationId = id
    const userId = user_id

    const { serviceIds } = await request.json()

    // Vérifier si l'utilisateur actuel est administrateur de l'organisation
    const currentUserMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: "ADMIN",
      },
    })

    const isSelfEdit = session.user.id === userId

    if (!currentUserMembership && !isSelfEdit) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour modifier les services de ce membre" },
        { status: 403 },
      )
    }

    // Vérifier si le membre existe dans l'organisation
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé dans cette organisation" }, { status: 404 })
    }

    // Vérifier que tous les services appartiennent à l'organisation
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
    })

    if (services.length !== serviceIds.length) {
      return NextResponse.json({ error: "Certains services n'appartiennent pas à cette organisation" }, { status: 400 })
    }

    // Supprimer toutes les associations existantes
    await prisma.userService.deleteMany({
      where: {
        userId,
        service: {
          organizationId,
        },
      },
    })

    // Créer les nouvelles associations
    const userServices = await Promise.all(
      serviceIds.map((serviceId: string) =>
        prisma.userService.create({
          data: {
            userId,
            serviceId,
          },
          include: {
            service: true,
          },
        }),
      ),
    )

    return NextResponse.json({
      services: userServices.map((us) => us.service),
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des services:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour des services" }, { status: 500 })
  }
}
