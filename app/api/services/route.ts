import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, durationMin, durationMax, image } = await request.json()

    if (!name || !price || !durationMin || !durationMax) {
      return NextResponse.json({ error: "Les informations du service sont incomplètes ou invalides" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        durationMin,
        durationMax,
        image,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Erreur lors de la création du service:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du service" }, { status: 500 })
  }
}

