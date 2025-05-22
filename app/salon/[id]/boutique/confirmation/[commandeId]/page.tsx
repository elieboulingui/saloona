import { notFound } from "next/navigation"
import { prisma } from "@/utils/prisma"
import { OrderConfirmationClient } from "./order-confirmation-client"

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string; commandeId: string }>
}) {

  const {id , commandeId} = await params

  // Récupérer les détails de la commande depuis la base de données
  const order = await prisma.order.findUnique({
    where: {
      id: commandeId,
      organizationId: id,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      organization: {
        select: {
          name: true,
          address: true,
          phone: true,
        },
      },
    },
  })

  // Si la commande n'existe pas, renvoyer une page 404
  if (!order) {
    notFound()
  }

  return <OrderConfirmationClient order={order} organizationId={id} />
}
