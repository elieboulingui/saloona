import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id_category: string, id : string }> }
) {
  try {

    const { id_category , id} = await params

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id:id_category },
      include: {
        products: true,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 })
    }

    // Vérifier si la catégorie contient des produits
    if (category.products.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une catégorie contenant des produits" },
        { status: 400 },
      )
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id : id_category },
    })

    revalidatePath(`/admin/${id}/boutique/category`)
    revalidatePath(`/admin/${id}/boutique`)
    revalidatePath(`/${id}/boutique`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la catégorie" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 })
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 })
    }

    // Mettre à jour la catégorie
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    })

    revalidatePath("/admin/boutique/category")
    revalidatePath("/admin/boutique")
    revalidatePath("/boutique")

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la catégorie" },
      { status: 500 },
    )
  }
}

