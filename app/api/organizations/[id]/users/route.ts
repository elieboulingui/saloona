import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { Role } from "@prisma/client";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const {id : organizationId} = await params
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as Role | undefined;

    // Récupérer les utilisateurs de l'organisation
    const users = await prisma.userOrganization.findMany({
      where: {
        organizationId,
        ...(role ? { role: role } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            speciality: true,
            services : true
          },
        },
      },
    })

    // Transformer les données pour n'avoir que les informations des utilisateurs
    const formattedUsers = users.map((userOrg) => ({
      id: userOrg.user.id,
      name: userOrg.user.name || "Sans nom",
      email: userOrg.user.email,
      image: userOrg.user.image,
      phone: userOrg.user.phone,
      speciality: userOrg.user.speciality,
      role: userOrg.role,
      services: userOrg.user.services,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des utilisateurs" },
      { status: 500 },
    )
  }
}
