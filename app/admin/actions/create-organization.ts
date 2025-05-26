"use server"

import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { redirect } from "next/navigation"
import { z } from "zod"

const createOrganizationSchema = z.object({
  salonName: z.string().min(3, "Le nom du salon doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  departmentIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins un département"),
})

export async function createOrganization(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié")
  }

  // Extraire les données du FormData
  const rawData = {
    salonName: formData.get("salonName") as string,
    address: formData.get("address") as string,
    description: formData.get("description") as string,
    departmentIds: formData.getAll("departmentIds") as string[],
  }

  // Valider les données
  const validatedData = createOrganizationSchema.parse(rawData)

  try {
    // Créer l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.salonName,
        address: validatedData.address,
        description: validatedData.description || null,
        ownerId: session.user.id,
      },
    })

    // Ajouter l'utilisateur comme membre de l'organisation
    await prisma.userOrganization.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        role: "ADMIN", // Changé de "OWNER" à "ADMIN"
      },
    })

    // Associer les départements à l'organisation
    if (validatedData.departmentIds.length > 0) {
      await prisma.organizationDepartment.createMany({
        data: validatedData.departmentIds.map((departmentId) => ({
          organisationId: organization.id, // Changé de "organizationId" à "organisationId"
          departmentId,
        })),
      })
    }

    // Rediriger vers la page admin
    redirect("/admin")
  } catch (error) {
    console.error("Erreur lors de la création de l'organisation:", error)
    throw new Error("Erreur lors de la création du salon")
  }
}
