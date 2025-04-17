import { generateConfirmationToken } from "@/utils/generateToken"
import { prisma } from "@/utils/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { inngest } from "@/inngest/client";


export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des utilisateurs" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role, image } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Informations manquantes pour créer l'utilisateur" }, { status: 400 })
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec un compte d'authentification
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
        image,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: email,
            refresh_token: null,
            access_token: null,
            expires_at: null,
            token_type: null,
            scope: null,
            id_token: null,
            session_state: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        image: true,
      },
    })

    // Envoi de l'email de confirmation
    const confirmationToken = generateConfirmationToken();

    // Enregistrer le token dans la base de données (à adapter selon ta structure)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: confirmationToken,
        expires: new Date(Date.now() + 3600000) // Expires in 1 hour
      }
    });


    const emailTemplate = `
          <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invitation  ${role === "ADMIN" ? "Administrateur" : "Coiffeur"}</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 20px;">
              
                <h2 style="text-align: center; color: #000000;">Bienvenue sur Dread In Gabon</h2>
              
                <p>Bonjour <strong>${name}</strong>,</p>
              
                <p>Vous avez été invité à rejoindre la plateforme <strong>Dread In Gabon</strong> en tant que ${role}.</p>
              
                <p>Voici vos informations de connexion :</p>
              
                <ul>
                  <li><strong>Email :</strong> ${email}</li>
                  <li><strong>Mot de passe :</strong> ${password}</li>
                </ul>
              
                <p>Pour vous connecter, cliquez sur le lien ci-dessous :</p>
              
                <p style="text-align: center;">
                  <a href="https://sadji.vercel.app/connexion" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
                    Accéder à Dreads In Gabon
                  </a>
                </p>
              
                <p>Nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
              
                <p>Si vous n'êtes pas à l'origine de cette invitation, veuillez ignorer cet email.</p>
              
                <p>Cordialement,<br> L'équipe Dread In Gabon</p>

              </body>
          </html>
          `;

    // 📩 Envoi d'un job Inngest pour envoyer l'email de confirmation
    await inngest.send({
      name: "email/sender",
      data: {
        email: email,
        displayName: name,
        subject: `Créaction de compte ${role}`,
        emailbody : emailTemplate
      },
    });

    return NextResponse.json(user)

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création de l'utilisateur" }, { status: 500 })
  }
}

