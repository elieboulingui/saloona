import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      products,
      categories,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des produits" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, stock, categoryId, image } = await request.json()

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du produit" }, { status: 500 })
  }
}

