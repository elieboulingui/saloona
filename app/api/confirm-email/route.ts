import { NextResponse } from 'next/server';
import { prisma } from "@/utils/prisma"


export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
  }

  try {
    // Trouver le token de vérification en utilisant identifier et token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        expires: {
          gt: new Date(), // Assure que le token n'est pas expiré
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Token invalide ou expiré.' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    await prisma.user.updateMany({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Supprimer le token de vérification
    await prisma.verificationToken.deleteMany({
      where: { token },
    });

    return NextResponse.json({ message: 'Email vérifié avec succès.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
