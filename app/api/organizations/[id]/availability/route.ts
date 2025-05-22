import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"


// GET: Récupérer les disponibilités d'une organisation
export async function GET(  req: Request,
    { params }: { params: Promise<{ id: string }>}
  ) {
    try {
      const {id : organizationId} = await params

      const session = await auth()
      if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      }
  
      // Vérifier si l'utilisateur est administrateur
      const membership = await prisma.userOrganization.findFirst({
        where: {
          organizationId,
          userId: session.user.id,
          role: "ADMIN",
        },
      })
  
      if (!membership) {
        return NextResponse.json({ error: "Vous n'êtes pas autorisé à accéder à cette organisation" }, { status: 403 })
      }
  
      // Chercher les disponibilités
      let availability = await prisma.organizationAvailability.findUnique({
        where: {
          organizationId,
        },
      })
  
      // Si aucune disponibilité, en créer une avec les valeurs par défaut définies dans Prisma
      if (!availability) {
        availability = await prisma.organizationAvailability.create({
          data: {
            organizationId,
          },
        })
  
        console.info(`Disponibilités créées par défaut pour l'organisation ${organizationId}`)
      }
  
      return NextResponse.json(availability)
    } catch (error) {
      console.error("Erreur lors de la récupération des disponibilités:", error)
      return NextResponse.json({ error: "Erreur lors de la récupération des disponibilités" }, { status: 500 })
    }
  }
  
  

// PATCH: Mettre à jour les disponibilités d'une organisation
export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }>}
  ) {
    try {
      const {id : organizationId} = await params

      const session = await auth()
      if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      }
  
      const data = await req.json()
  
      // Vérification du rôle ADMIN
      const membership = await prisma.userOrganization.findFirst({
        where: {
          organizationId,
          userId: session.user.id,
          role: "ADMIN",
        },
      })
  
      if (!membership) {
        return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier cette organisation" }, { status: 403 })
      }
  
      // Vérifie si la disponibilité existe
      const existingAvailability = await prisma.organizationAvailability.findUnique({
        where: {
          organizationId,
        },
      })
  
      let availability
  
      if (existingAvailability) {
        availability = await prisma.organizationAvailability.update({
          where: {
            id: existingAvailability.id,
          },
          data,
        })
      } else {
        availability = await prisma.organizationAvailability.create({
          data: {
            ...data,
            organizationId,
          },
        })
      }
  
      return NextResponse.json(availability)
    } catch (error) {
      console.error("Erreur lors de la mise à jour des disponibilités:", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour des disponibilités" }, { status: 500 })
    }
  }
  
