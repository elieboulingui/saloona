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


export async function POST(request: Request,
  { params }: { params: Promise<{ id: string}> }
) {
try {

    const { id : organizationId } = await params
    const body = await request.json()

    const { firstName, phoneNumber, address, additionalInfo, items, totalAmount, deliveryFee = 2000 } = body

    // Validation des données
    if (!firstName || !phoneNumber || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Données invalides. Veuillez fournir toutes les informations requises." },
        { status: 400 },
      )
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organisation non trouvée" }, { status: 404 })
    }

    // Créer la commande avec une transaction pour garantir l'intégrité des données
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          firstName,
          phoneNumber,
          address,
          additionalInfo,
          totalAmount,
          deliveryFee,
          organizationId,
        },
      })

      // Créer les éléments de la commande
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })

        // Mettre à jour le stock du produit (optionnel)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      data: order,
    })
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création de la commande" }, { status: 500 })
  }
}

