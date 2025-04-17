import { NextResponse } from 'next/server';
import { prisma } from "@/utils/prisma"

import { sendMail } from '@/utils/mail'; // Chemin vers ton fichier de fonction d'envoi d'email
import crypto from 'crypto';

export async function POST(request: Request) {

  const { email } = await request.json();

  try {
    // Vérifie si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "L'utilisateur n'existe pas." }, { status: 404 });
    }

    // Générer un nouveau token de confirmation
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    // Enregistrer le token dans la base de données (à adapter selon ta structure)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: confirmationToken,
        expires: new Date(Date.now() + 3600000) // Expires in 1 hour
      }
    });

    // Envoyer le mail de confirmation
    const confirmationUrl = `https://sadji.vercel.app/reset-password?token=${confirmationToken}`;
    
    await sendMail({
      to: email,
      name: "Dreads In Gabon",
      subject: "Réinitialisation de mot de passe",
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f4f8;">
      <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center;">
        <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
        <p style="color: #555;">Bonjour,</p>
        <p style="color: #555;">
          Nous avons reçu une demande de réinitialisation de votre mot de passe. 
          Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
        </p>
        <a href="${confirmationUrl}" 
           style="display: inline-block; padding: 12px 24px; margin: 20px 0; text-decoration: none; background-color: #fe9a00; color: black; border-radius: 6px; font-weight: bold;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #555;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
        </p>
        <p style="color: #888; font-size: 12px;">
          Ce lien expirera dans une heure pour des raisons de sécurité.
        </p>
      </div>
    </div>
  `
    });

    return NextResponse.json({ message: "Un email de confirmation a été envoyé." });

  } catch (error) {
    return NextResponse.json({ error: "Une erreur s'est produite lors de l'envoi du mail de confirmation." }, { status: 500 });
  }
}
