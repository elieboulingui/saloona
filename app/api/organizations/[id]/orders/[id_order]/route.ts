import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la commande" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    const { status } = await request.json()

    const order = await prisma.order.update({
      where: { id: id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la commande" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    await prisma.order.delete({
      where: { id:id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la commande" },
      { status: 500 },
    )
  }
}

