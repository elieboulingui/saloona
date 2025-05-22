import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string}> }
) {
try {

    const { id } = await params

    const products = await prisma.product.findMany({
      where: {
        organizationId: id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const categories = await prisma.category.findMany({
      where: {
        organizationId: id,
      },
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

export async function POST(request: Request,
  { params }: { params: Promise<{ id: string}> }
){
try {

    const { id } = await params

    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    // Vérifier si l'utilisateur est membre de l'organisation
    const userMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId: id,
      },
    })
    if (!userMembership) {
      return NextResponse.json({ error: "Accès non autorisé à cette organisation" }, { status: 403 })
    }
    // Récupérer les données du produit à partir de la requête
    const { name, description, price, stock, categoryId, image } = await request.json()

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image,
        organizationId: id,
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

