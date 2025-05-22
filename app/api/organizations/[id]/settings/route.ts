import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function PATCH(request: Request,  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id  : organizationId } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, logoUrl, imageCover } = body

    console.log("Received data:", body)

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
        { error: "Vous n'avez pas les droits pour modifier les paramètres de cette organisation" },
        { status: 403 },
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (logoUrl !== undefined) updateData.logo = logoUrl
    if (imageCover !== undefined) updateData.imageCover = imageCover

    // Mettre à jour l'organisation
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    })

    return NextResponse.json({
      ...organization,
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres de l'organisation:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour des paramètres de l'organisation" },
      { status: 500 },
    )
  }
}
