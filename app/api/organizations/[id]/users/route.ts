import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { Role } from "@prisma/client";
import { inngest } from "@/inngest/client";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const {id : organizationId} = await params
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as Role | undefined;

    // Récupérer les utilisateurs de l'organisation
    const users = await prisma.userOrganization.findMany({
      where: {
        organizationId,
        ...(role ? { role: role } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            speciality: true,
            services : true
          },
        },
      },
    })

    // Transformer les données pour n'avoir que les informations des utilisateurs
    const formattedUsers = users.map((userOrg) => ({
      id: userOrg.user.id,
      name: userOrg.user.name || "Sans nom",
      email: userOrg.user.email,
      image: userOrg.user.image,
      phone: userOrg.user.phone,
      speciality: userOrg.user.speciality,
      role: userOrg.role,
      services: userOrg.user.services,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des utilisateurs" },
      { status: 500 },
    )
  }
}


export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const {id: organizationId} = await params
    const body = await request.json()
    const { name, email, phone, role, password, speciality, image, organizationRole } = body

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
        { error: "Vous n'avez pas les droits pour ajouter des membres à cette organisation" },
        { status: 403 },
      )
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    let userId: string

    if (existingUser) {

      // L'utilisateur existe déjà, vérifier s'il est déjà membre de l'organisation
      const existingMembership = await prisma.userOrganization.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      })

      if (existingMembership) {
        return NextResponse.json({ error: "Cet utilisateur est déjà membre de l'organisation" }, { status: 400 })
      }

      userId = existingUser.id
      
    } else {

      // Créer un nouvel utilisateur
      const hashedPassword = await bcrypt.hash(password, 12)

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          role,
          password: hashedPassword,
          speciality,
          image,
        },
      })

      userId = newUser.id

      // Envoyer un email de bienvenue
      const emailTemplate = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue dans l'organisation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="text-align: center; color: #000000;">Bienvenue dans l'organisation</h2>
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>Vous avez été ajouté à une organisation sur notre plateforme.</p>
            <p>Voici vos informations de connexion :</p>
            <ul>
              <li><strong>Email :</strong> ${email}</li>
              <li><strong>Mot de passe :</strong> ${password}</li>
            </ul>
            <p>Pour vous connecter, cliquez sur le lien ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/connexion" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
                Se connecter
              </a>
            </p>
            <p>Nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
            <p>Cordialement,<br> L'équipe</p>
          </body>
        </html>
      `

      await inngest.send({
        name: "email/sender",
        data: {
          email: email,
          displayName: name,
          subject: "Bienvenue dans l'organisation",
          emailbody: emailTemplate,
        },
      })
    }

    // Ajouter l'utilisateur à l'organisation
    const membership = await prisma.userOrganization.create({
      data: {
        userId,
        organizationId,
        role: organizationRole || "BARBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true,
            speciality: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      phone: membership.user.phone,
      role: membership.user.role,
      image: membership.user.image,
      createdAt: membership.user.createdAt,
      speciality: membership.user.speciality,
      organizationRole: membership.role,
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un membre:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de l'ajout du membre" }, { status: 500 })
  }
}
