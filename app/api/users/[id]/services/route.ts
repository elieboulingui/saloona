import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params


    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
        where: { id: id },
      })
  
      if (!user) {
        return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
      }
  
      // Récupérer les services de l'utilisateur
      const userServices = await prisma.userService.findMany({
        where: { id },
        include: {
          service: true,
        },
      })
  
      // Extraire les services
      const services = userServices.map((userService) => userService.service)
  
      return NextResponse.json({ services })
    } catch (error) {
      console.error("Erreur lors de la récupération des services de l'utilisateur:", error)
      return NextResponse.json(
        { error: "Une erreur est survenue lors de la récupération des services de l'utilisateur" },
        { status: 500 },
      )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params
    const { serviceIds } = await request.json()

    if (!Array.isArray(serviceIds)) {
      return NextResponse.json({ error: "serviceIds doit être un tableau" }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: id },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Supprimer toutes les associations existantes
    await prisma.userService.deleteMany({
      where: { id },
    })

    // Créer les nouvelles associations
    const userServices = await Promise.all(
      serviceIds.map(async (serviceId) => {
        return prisma.userService.create({
          data: {
            userId:id,
            serviceId,
          },
          include: {
            service: true,
          },
        })
      }),
    )

    // Extraire les services
    const services = userServices.map((userService) => userService.service)

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des services de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour des services de l'utilisateur" },
      { status: 500 },
    )
  }
}

