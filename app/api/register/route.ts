import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { inngest } from "@/inngest/client";

// Schéma de validation avec departmentLabels
const registerSchema = z.object({
  salonName: z.string().min(3),
  address: z.string().min(5),
  description: z.string().optional(),
  departmentLabels: z.array(z.string().min(1)).min(1),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.format());
      return NextResponse.json(
        { message: "Données d'inscription invalides", errors: validationResult.error.format() },
        { status: 400 },
      );
    }

    const {
      salonName,
      address,
      description,
      departmentLabels,
      fullName,
      email,
      phone,
      password,
    } = validationResult.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaction complète
    const result = await prisma.$transaction(async (tx) => {
      // Création utilisateur
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          phone,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      // Création organisation
      const organization = await tx.organization.create({
        data: {
          name: salonName,
          address,
          description,
          ownerId: user.id,
          verificationStatus: "pending",
        },
      });

      // Création relation user-organization
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Récupérer départements existants par label
      const departments = await tx.department.findMany({
        where: { label: { in: departmentLabels } },
        select: { id: true, label: true },
      });

      // Vérifier que tous les labels reçus existent
     
      // Créer relations organisation-départements
      await tx.organizationDepartment.createMany({
        data: departments.map((dept) => ({
          organisationId: organization.id, // corrigé ici (organizationId et non organisationId)
          departmentId: dept.label,
        })),
      });

      return { user, organization };
    });

    // Préparer le template email
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>
        <h2>Bienvenue ${result.user.name} !</h2>
        <p>Votre salon <strong>${result.organization.name}</strong> a bien été enregistré. Nous traitons votre demande.</p>
        <p>Email : ${result.user.email}<br>Téléphone : ${phone}</p>
        <p>Merci de votre confiance,<br>L'équipe</p>
      </body>
      </html>
    `;

    // Envoi de l’email via Inngest
    await inngest.send({
      name: "email/sender",
      data: {
        email: result.user.email,
        displayName: result.user.name,
        subject: "Bienvenue - Confirmation de création de compte",
        emailbody: emailTemplate,
      },
    });

    return NextResponse.json(
      {
        message: "Incription réussie",
        userId: result.user.id,
        organisationId: result.organization.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription",
      },
      { status: 500 },
    );
  }
}
