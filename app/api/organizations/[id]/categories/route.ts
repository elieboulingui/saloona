import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string}> }
) {
try {

    const { id } = await params

    const categories = await prisma.category.findMany({
      where: {
        organizationId: id,
      },
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


