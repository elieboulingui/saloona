import { redirect } from "next/navigation"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function checkOrganizationMembership(organizationId: string) {
  try {

    const session = await auth()
   
    if (!session || !session.user) {
      redirect("/connexion")
    }

    const userId = session.user.id

    // Vérifier si l'utilisateur est membre de l'organisation
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    })

    if (!membership) {
      redirect("/")
    }

    // L'utilisateur est membre, continuer
    return membership
    
  } catch (error) {
    console.error("Erreur lors de la vérification de l'appartenance:", error)
    redirect("/")
  }
}
