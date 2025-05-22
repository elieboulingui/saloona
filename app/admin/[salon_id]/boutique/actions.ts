"use server"

import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"

// Récupérer tous les produits avec leurs catégories
export async function getProducts() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        })

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des produits")
        }

        const products = await response.json()

        const responseCategories = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        })

        if (!responseCategories.ok) {
            throw new Error("Erreur lors de la récupération des catégories")
        }

        const categories = await responseCategories.json()

        return {
            success: true,
            products,
            categories,
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la récupération des produits",
        }
    }
}

// Créer un nouveau produit
export async function createProduct(data: {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    image?: string
    organizationId: string
}) {
    try {

        const { name, description, price, stock, categoryId, image, organizationId } = data

        if (!name || !price || !categoryId || !stock) {
            return {
                success: false,
                error: "Veuillez remplir les champs obligatoires",
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                image,
                organizationId
            },
            include: {
                category: true,
            },
        })

        revalidatePath("/admin/boutique")
        revalidatePath("/boutique")

        return {
            success: true,
            data: product,
        }
    } catch (error) {
        console.error("Erreur lors de la création du produit:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la création du produit",
        }
    }
}

// Mettre à jour un produit existant
export async function updateProduct(
    id: string,
    data: {
        name: string
        description: string
        price: number
        stock: number
        categoryId: string
        image?: string
    },
) {
    try {
    
        const { name, description, price, stock, categoryId, image } = data

        if (!name || !price || !categoryId || !stock) {
            return {
                success: false,
                error: "Veuillez remplir les champs obligatoires",
            }
        }

        const product = await prisma.product.update({
            where: { id: id },
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

        revalidatePath("/admin/boutique")
        revalidatePath("/boutique")

        return {
            success: true,
            data: product,
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du produit",
        }
    }
}

// Supprimer un produit
export async function deleteProduct(id: string) {
    try {

        const product = await prisma.product.delete({
            where: { id: id },
        })

        revalidatePath("/admin/boutique")
        revalidatePath("/boutique")

        return {
            success: true,
        }
        
    } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du produit",
        }
    }
}

// Créer une nouvelle catégorie
export async function createCategory(name: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        })

        if (!response.ok) {
            throw new Error("Erreur lors de la création de la catégorie")
        }

        const category = await response.json()

        revalidatePath("/admin/boutique")

        return {
            success: true,
            data: category,
        }
    } catch (error) {
        console.error("Erreur lors de la création de la catégorie:", error)
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de la catégorie",
        }
    }
}

