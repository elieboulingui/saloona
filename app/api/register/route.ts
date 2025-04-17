import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/utils/prisma"
import { inngest } from "@/inngest/client"

// Schéma de validation pour les données d'inscription
const registerSchema = z.object({
  salonName: z.string().min(3),
  address: z.string().min(5),
  description: z.string().optional(),
  departmentIds: z.array(z.string()).min(1),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    // Récupérer et valider les données
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Données d'inscription invalides", errors: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { salonName, address, description, departmentIds, fullName, email, phone, password } =
      validationResult.data

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 409 })
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Utiliser une approche plus robuste pour les transactions
    try {
      // Créer l'utilisateur avec le rôle ADMIN
      const user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          phone,
          password: hashedPassword,
          role: "ADMIN",
        },
      })

      // Créer l'organisation
      const organization = await prisma.organization.create({
        data: {
          name: salonName,
          address,
          description,
          ownerId: user.id,
          verificationStatus: "pending",
        },
      })

      // Créer la relation UserOrganization
      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      })

      // Associer les départements sélectionnés à l'organisation via la table pivot
      if (departmentIds && departmentIds.length > 0) {
        // Créer toutes les relations département-organisation en une seule opération
        await prisma.organizationDepartment.createMany({
          data: departmentIds.map((departmentId) => ({
            organisationId: organization.id,
            departmentId: departmentId,
          })),
        })
      }

      // Préparer le template d'email
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur notre plateforme</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #F59E0B;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #fff;
              padding: 30px;
              border: 1px solid #eaeaea;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #F59E0B;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
            .highlight {
              color: #F59E0B;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur notre plateforme!</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${fullName},</h2>
              
              <p>Nous sommes ravis de vous accueillir! Votre compte pour <span class="highlight">${salonName}</span> a été créé avec succès.</p>
              
              <p>Votre demande d'inscription est actuellement <strong>en cours d'examen</strong> par notre équipe. Nous vous contacterons très prochainement pour finaliser votre inscription et vous aider à configurer votre espace salon.</p>
              
              <p>Récapitulatif de vos informations :</p>
              <ul>
                <li><strong>Salon :</strong> ${salonName}</li>
                <li><strong>Adresse :</strong> ${address}</li>
                <li><strong>Email :</strong> ${email}</li>
                <li><strong>Téléphone :</strong> ${phone}</li>
              </ul>
              
              <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>
              L'équipe</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tous droits réservés.</p>
              <p>Cet email a été envoyé à ${email} car vous vous êtes inscrit sur notre plateforme.</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Envoyer l'email de confirmation en utilisant la fonction inngest existante
      await inngest.send({
        name: "email/sender",
        data: {
          email: email,
          displayName: fullName,
          subject: "Bienvenue - Confirmation de création de compte",
          emailbody: emailTemplate,
        },
      })

      // Réponse de succès
      return NextResponse.json(
        {
          message: "Inscription réussie",
          userId: user.id,
          organizationId: organization.id,
        },
        { status: 201 },
      )
    } catch (transactionError) {
      console.error("Erreur lors de la transaction:", transactionError)
      return NextResponse.json({ message: "Une erreur est survenue lors de la création du compte" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    return NextResponse.json({ message: "Une erreur est survenue lors de l'inscription" }, { status: 500 })
  }
}
