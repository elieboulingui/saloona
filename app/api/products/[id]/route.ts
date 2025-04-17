import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id: id },
            include: {
                category: true,
            },
        })

        if (!product) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error)
        return NextResponse.json({ error: "Une erreur est survenue lors de la récupération du produit" }, { status: 500 })
    }
}

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params
        const { name, description, price, stock, categoryId, image } = await request.json()

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

        return NextResponse.json(product)
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit:", error)
        return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du produit" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params
        await prisma.product.delete({
            where: { id: id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error)
        return NextResponse.json({ error: "Une erreur est survenue lors de la suppression du produit" }, { status: 500 })
    }
}

