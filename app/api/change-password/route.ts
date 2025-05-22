import { NextResponse } from 'next/server';
import { prisma } from "@/utils/prisma"
import z from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
    token: z.string().min(12, "Ce token n'est pas correct"),
    password: z.string().min(6, "Le mot de passe doit avoir au moins 6 caractères")
});

export async function POST(request: Request) {

    const body = await request.json();

    // Validation du corps de la requête
    const parsedBody = registerSchema.parse(body);
    const { token, password } = parsedBody;

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        // Trouver le token de vérification valide
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

        // Mettre à jour l'utilisateur avec le nouveau mot de passe haché
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword },
        });

        // Supprimer le token de vérification après usage
        await prisma.verificationToken.deleteMany({
            where: { token },
        });

        return NextResponse.json({ message: 'Mot de passe mis à jour avec succès ! Veuillez vous connecter.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
    }
}
