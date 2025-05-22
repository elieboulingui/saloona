import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ isMember: false }, { status: 401 })
    }

    const userId = session.user.id
    const organizationId = id

    // Vérifier si l'utilisateur est membre de l'organisation
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    })

    return NextResponse.json({ isMember: !!membership })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'appartenance:", error)
    return NextResponse.json({ isMember: false, error: "Une erreur est survenue" }, { status: 500 })
  }
}
