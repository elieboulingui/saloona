import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string; serviceId: string }> }) {
 try {

   const session = await auth()
   if (!session?.user) {
     return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
   }

   const { id: organizationId,serviceId } =  await params

   const { userId } = await request.json()

   // Vérifier si l'utilisateur actuel est administrateur de l'organisation
   const userMembership = await prisma.userOrganization.findFirst({
     where: {
       userId: session.user.id,
       organizationId,
       role: "ADMIN",
     },
   })

   if (!userMembership) {
     return NextResponse.json(
       { error: "Vous n'avez pas les droits pour assigner des services dans cette organisation" },
       { status: 403 },
     )
   }

   // Vérifier si le service existe et appartient à l'organisation
   const existingService = await prisma.service.findUnique({
     where: {
       id: serviceId,
       organizationId,
     },
   })

   if (!existingService) {
     return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
   }

   // Vérifier si l'utilisateur existe et est membre de l'organisation
   const userOrganization = await prisma.userOrganization.findFirst({
     where: {
       userId,
       organizationId,
     },
   })

   if (!userOrganization) {
     return NextResponse.json({ error: "Utilisateur non trouvé ou n'est pas membre de cette organisation" }, { status: 404 })
   }

   // Vérifier si l'association existe déjà
   const existingAssignment = await prisma.userService.findFirst({
     where: {
       userId,
       serviceId,
     },
   })

   if (existingAssignment) {
     return NextResponse.json({ error: "Ce service est déjà assigné à cet utilisateur" }, { status: 400 })
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

   return NextResponse.json({ success: true, data: userService })
 } catch (error) {
   console.error("Erreur lors de l'assignation du service à l'utilisateur:", error)
   return NextResponse.json(
     { error: "Une erreur est survenue lors de l'assignation du service à l'utilisateur" },
     { status: 500 },
   )
 }
}