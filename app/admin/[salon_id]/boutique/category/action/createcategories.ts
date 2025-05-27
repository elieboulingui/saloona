"use server"

import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache" // si tu veux invalider le cache / revalider une route (optionnel)
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  salonId: z.string().min(1),
})

export async function createCategory(data: { name: string; salonId: string }) {
  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(", "))
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        organizationId: parsed.data.salonId,
      },
    })

    // Par exemple, si tu utilises ISR ou cache Next.js, invalide ici
    // revalidatePath(`/some-path/${parsed.data.organizationId}`)

    return category
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    throw new Error("Une erreur est survenue lors de la création de la catégorie")
  }
}
