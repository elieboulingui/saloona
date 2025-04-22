import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

// Récupérer les détails d'un membre spécifique
export async function GET(request: Request,
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

    // Récupérer les détails du membre spécifique
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            speciality: true,
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 })
    }

    // Formater les données pour le frontend
    const formattedMember = {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      phone: membership.user.phone,
      role: membership.user.role,
      image: membership.user.image,
      createdAt: membership.user.createdAt,
      updatedAt: membership.user.updatedAt,
      speciality: membership.user.speciality,
      services: membership.user.services,
      organizationRole: membership.role,
    }

    return NextResponse.json(formattedMember)
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du membre:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des détails du membre" },
      { status: 500 },
    )
  }
}

// Mettre à jour un membre
export async function PATCH(request: Request,
  { params }: { params: Promise<{ id: string , user_id : string}> }
) {
try {

  const { id : organizationId, user_id : userId } = await params
    
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }


    const body = await request.json()
    const { name, email, phone, role, password, speciality, image, organizationRole } = body

    // Vérifier si l'utilisateur actuel est administrateur de l'organisation ou s'il modifie son propre profil
    const currentUserMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    })

    const isAdmin = currentUserMembership?.role === "ADMIN"
    const isSelfEdit = session.user.id === userId

    if (!currentUserMembership || (!isAdmin && !isSelfEdit)) {
      return NextResponse.json({ error: "Vous n'avez pas les droits pour modifier ce membre" }, { status: 403 })
    }

    // Vérifier si le membre existe
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 })
    }

    // Préparer les données à mettre à jour pour l'utilisateur
    const userUpdateData: any = {}
    if (name) userUpdateData.name = name
    if (email) userUpdateData.email = email
    if (phone !== undefined) userUpdateData.phone = phone
    if (role && isAdmin) userUpdateData.role = role
    if (speciality !== undefined) userUpdateData.speciality = speciality
    if (image !== undefined) userUpdateData.image = image
    if (password) userUpdateData.password = await bcrypt.hash(password, 12)

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        speciality: true,
      },
    })

    // Mettre à jour le rôle dans l'organisation si nécessaire et si l'utilisateur est admin
    if (organizationRole && isAdmin) {
      await prisma.userOrganization.update({
        where: {
          id: membership.id,
        },
        data: {
          role: organizationRole,
        },
      })
    }

    // Récupérer les données mises à jour
    const updatedMembership = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    })

    return NextResponse.json({
      ...updatedUser,
      organizationRole: updatedMembership?.role,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du membre" }, { status: 500 })
  }
}

// Supprimer un membre de l'organisation
export async function DELETE(request: Request,
  { params }: { params: Promise<{ id: string , user_id : string}> }
) {
try {

    const { id : organizationId, user_id : userId } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    // Vérifier si l'utilisateur actuel est administrateur de l'organisation
    const currentUserMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: "ADMIN",
      },
    })

    if (!currentUserMembership) {
      return NextResponse.json({ error: "Vous n'avez pas les droits pour supprimer des membres" }, { status: 403 })
    }

    // Vérifier si le membre existe
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 })
    }

    // Supprimer le membre de l'organisation
    await prisma.userOrganization.delete({
      where: {
        id: membership.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la suppression du membre" }, { status: 500 })
  }
}
