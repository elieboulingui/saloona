import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
        services : {
          include : 
          {
            service : true
          }
        }
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'utilisateur" },
      { status: 500 },
    )
  }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const body = await request.json()
    const { name, email, phone, role, image } = body

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role) updateData.role = role
    if (image !== undefined) updateData.image = image

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de l'utilisateur" },
      { status: 500 },
    )
  }
}

export async function DELETE(    request: Request,
    { params }: { params: Promise<{ id: string }> }
){
  try {

    const {id} = await params

    // Supprimer d'abord les comptes associés
    await prisma.account.deleteMany({
      where: { userId: id },
    })

    // Supprimer les sessions associées
    await prisma.session.deleteMany({
      where: { userId: id },
    })

    // Supprimer les authentificateurs associés
    await prisma.authenticator.deleteMany({
      where: { userId: id },
    })

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de l'utilisateur" },
      { status: 500 },
    )
  }
}

