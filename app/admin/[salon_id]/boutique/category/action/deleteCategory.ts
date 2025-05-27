"use server"

import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"

export async function deleteCategory(salonId: string, categoryId: string) {
  // Supposons que tu utilises Prisma ou un autre ORM pour la suppression
  // Exemple avec Prisma:
  
  await prisma.category.delete({
    where: {
      id: categoryId,
      organizationId: salonId,
    },
  })
  

  // OU si tu as une autre méthode pour supprimer, adapte ici

  // Revalide la page ou la route qui liste les catégories après suppression
  revalidatePath(`/organizations/${salonId}/categories`)
}
