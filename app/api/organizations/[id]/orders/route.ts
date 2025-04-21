import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string}> }
) {
try {

    const { id } = await params

    const orders = await prisma.order.findMany({
      where : {
        organizationId : id
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des commandes" },
      { status: 500 },
    )
  }
}

