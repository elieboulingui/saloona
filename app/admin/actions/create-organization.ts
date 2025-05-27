"use server"

import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { z } from "zod"

const createOrganizationSchema = z.object({
  salonName: z.string().min(3, "Le nom du salon doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  departmentLabels: z.array(z.string()).min(1, "Veuillez sélectionner au moins un département"),
})

export async function createOrganization(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié")
  }

  const rawData = {
    salonName: formData.get("salonName") as string,
    address: formData.get("address") as string,
    description: formData.get("description") as string,
    departmentLabels: formData.getAll("departmentLabels") as string[],
  }

  // Validation des données entrantes
  const validatedData = createOrganizationSchema.parse(rawData)

  try {
    // 1. Création de l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.salonName,
        address: validatedData.address,
        description: validatedData.description || null,
        ownerId: session.user.id,
      },
    })

    // 2. Ajout de l'utilisateur comme admin de l'organisation
    await prisma.userOrganization.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        role: "ADMIN",
      },
    })

    // 3. Déduplication des labels pour éviter les doublons
    const uniqueLabels = Array.from(new Set(validatedData.departmentLabels))

    // 4. Pour chaque label, vérifier et créer département si nécessaire, puis associer à l'organisation
    for (const label of uniqueLabels) {
      // a) Chercher un département avec ce label
      let department = await prisma.department.findFirst({
        where: { label },
      })

      if (!department) {
        // b) Créer un département s'il n'existe pas
        department = await prisma.department.create({
          data: {
            label,
            icon: "", // Adapter ici si besoin
          },
        })
      }

      // c) Vérifier si l'association organisation-département existe déjà
      const existingLink = await prisma.organizationDepartment.findFirst({
        where: {
          organisationId: organization.id,
          departmentId: department.id,
        },
      })

      if (!existingLink) {
        // d) Créer la relation si elle n'existe pas
        await prisma.organizationDepartment.create({
          data: {
            organisationId: organization.id,
            departmentId: department.id,
          },
        })
      }
    }

    // 5. Redirection après succès
  } catch (error) {
    console.error("Erreur lors de la création de l'organisation:", error)
    throw new Error("Erreur lors de la création du salon")
  }
}
