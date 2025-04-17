"use server"

import { revalidatePath } from "next/cache"
import type { OrderStatus } from "@prisma/client"
import { prisma } from "@/utils/prisma"

// Récupérer toutes les commandes
export async function getOrders() {
    try {

        const orders = await prisma.order.findMany({
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

        return {
            success: true,
            orders,
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la récupération des commandes",
        }
    }
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {

        if (!orderId || !status) {
            return {
                success: false,
                error: "Impossible de mettre a jour la commande : Veuillez saisir tous les champs",
            }
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        revalidatePath("/admin/boutique/orders")

        return {
            success: true,
            data: order,
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la commande:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du statut de la commande",
        }
    }
}