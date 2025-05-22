"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/utils/prisma"

// Créer un nouveau service
export async function createService(data: {
  name: string
  description?: string
  price: number
  durationMin: number
  durationMax: number
  image?: string
  departmentId: string
  organizationId: string
}) {
  try {
    const { name, description, price, durationMin, durationMax, image, departmentId, organizationId } = data

    if (!name || !price || !durationMin || !durationMax || !departmentId || !organizationId) {
      return {
        success: false,
        error: "Veuillez remplir tous les champs obligatoires",
      }
    }

    // Vérifier si le département existe et appartient à l'organisation
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    })

    if (!department) {
      return {
        success: false,
        error: "Département non trouvé ou n'appartient pas à cette organisation",
      }
    }

    // Créer le service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        durationMin,
        durationMax,
        image,
        department: {
          connect: { id: departmentId },
        },
        organization: {
          connect: { id: organizationId },
        },
      },
      include: {
        department: true,
      },
    })

    revalidatePath(`/admin/${organizationId}/services`)

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
    name?: string
    description?: string
    price?: number
    durationMin?: number
    durationMax?: number
    image?: string
    departmentId?: string
    organizationId: string
  },
) {
  try {
    const { name, description, price, durationMin, durationMax, image, departmentId, organizationId } = data

    // Vérifier si le service existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return {
        success: false,
        error: "Service non trouvé",
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (durationMin !== undefined) updateData.durationMin = durationMin
    if (durationMax !== undefined) updateData.durationMax = durationMax
    if (image !== undefined) updateData.image = image

    // Vérifier si le département existe et appartient à l'organisation
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: {
          id: departmentId,
        },
      })

      if (!department) {
        return {
          success: false,
          error: "Département non trouvé ou n'appartient pas à cette organisation",
        }
      }

      updateData.department = { connect: { id: departmentId } }
    }

    // Mettre à jour le service
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
      },
    })

    revalidatePath(`/admin/${organizationId}/services`)
    revalidatePath(`/admin/${organizationId}/services/${id}`)

    return {
      success: true,
      data: updatedService,
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
export async function deleteService(id: string, organizationId: string) {
  try {
    // Vérifier si le service existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return {
        success: false,
        error: "Service non trouvé",
      }
    }

    // Supprimer le service
    await prisma.service.delete({
      where: { id },
    })

    revalidatePath(`/admin/${organizationId}/services`)

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

// Assigner un service à un utilisateur
export async function assignServiceToUser(serviceId: string, userId: string, organizationId: string) {
  try {
    // Vérifier si le service existe et appartient à l'organisation
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        organizationId,
      },
    })

    if (!service) {
      return {
        success: false,
        error: "Service non trouvé ou n'appartient pas à cette organisation",
      }
    }

    // Vérifier si l'utilisateur existe et est membre de l'organisation
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId,
      },
    })

    if (!userOrganization) {
      return {
        success: false,
        error: "Utilisateur non trouvé ou n'est pas membre de cette organisation",
      }
    }

    // Vérifier si l'association existe déjà
    const existingAssignment = await prisma.userService.findFirst({
      where: {
        userId,
        serviceId,
      },
    })

    if (existingAssignment) {
      return {
        success: false,
        error: "Ce service est déjà assigné à cet utilisateur",
      }
    }

    // Créer l'association
    const userService = await prisma.userService.create({
      data: {
        user: {
          connect: { id: userId },
        },
        service: {
          connect: { id: serviceId },
        },
      },
    })

    revalidatePath(`/admin/${organizationId}/services/${serviceId}`)
    revalidatePath(`/admin/${organizationId}/users/${userId}`)

    return {
      success: true,
      data: userService,
    }
  } catch (error) {
    console.error("Erreur lors de l'assignation du service à l'utilisateur:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'assignation du service à l'utilisateur",
    }
  }
}

// Retirer un service d'un utilisateur
export async function removeServiceFromUser(serviceId: string, userId: string, organizationId: string) {
  try {
    // Vérifier si l'association existe
    const userService = await prisma.userService.findFirst({
      where: {
        userId,
        serviceId,
      },
    })

    if (!userService) {
      return {
        success: false,
        error: "Ce service n'est pas assigné à cet utilisateur",
      }
    }

    // Supprimer l'association
    await prisma.userService.delete({
      where: {
        id: userService.id,
      },
    })

    revalidatePath(`/admin/${organizationId}/services/${serviceId}`)
    revalidatePath(`/admin/${organizationId}/users/${userId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Erreur lors du retrait du service de l'utilisateur:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors du retrait du service de l'utilisateur",
    }
  }
}
