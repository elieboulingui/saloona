import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des catégories" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création de la catégorie" }, { status: 500 })
  }
}

