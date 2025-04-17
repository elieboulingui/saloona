"use server"

import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"

// Récupérer tous les services
export async function getServices() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/services`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        })

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des services")
        }

        const services = await response.json()

        return {
            success: true,
            services,
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des services:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la récupération des services",
        }
    }
}

// Créer un nouveau service
export async function createService(data: {
    name: string
    description?: string
    price: number
    durationMin: number
    durationMax: number
    image?: string
}) {
    try {

        const { name, description, price, durationMin, durationMax, image } = data

        if (!name || !price || !durationMin || !durationMax) {
            return {
                success: false,
                error: "Veuillez remplir les champs obligatoires",
            }
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

        revalidatePath("/admin/services")
        revalidatePath("/services")

        return {
            success: true,
            data: service,
        }
    } catch (error) {
        console.error("Erreur lors de la création du service:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la création du service",
        }
    }
}

// Mettre à jour un service existant
export async function updateService(
    id: string,
    data: {
        name: string
        description: string
        price: number
        durationMin: number
        durationMax: number
        image?: string
    },
) {
    try {

        const { name, description, price, durationMin, durationMax, image } = data

        if (!name || !price || !durationMin || !durationMax) {
            return {
                success: false,
                error: "Veuillez remplir les champs obligatoires",
            }
        }

        const service = await prisma.service.update({
            where: { id: id },
            data: {
                name,
                description,
                price,
                durationMin,
                durationMax,
                image,
            },
        })

        revalidatePath("/admin/services")
        revalidatePath("/services")

        return {
            success: true,
            data: service,
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du service:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du service",
        }
    }
}

// Supprimer un service
export async function deleteService(id: string) {
    try {

        const service = await prisma.service.delete({
            where: { id: id },
        })
        
        revalidatePath("/admin/services")
        revalidatePath("/services")

        return {
            success: true,
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du service:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du service",
        }
    }
}

