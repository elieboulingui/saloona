import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { inngest } from "@/inngest/client";

// Schéma de validation
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
        {
          message: "Données d'inscription invalides",
          errors: validationResult.error.format(),
        },
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

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Crée l'utilisateur
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          phone,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      // Crée l'organisation
      const organization = await tx.organization.create({
        data: {
          name: salonName,
          address,
          description,
          ownerId: user.id,
          verificationStatus: "pending",
        },
      });

      // Lien entre l'utilisateur et l'organisation
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Récupère les départements existants
      const existingDepartments = await tx.department.findMany({
        where: { label: { in: departmentLabels } },
        select: { id: true, label: true },
      });

      const existingLabels = existingDepartments.map((d) => d.label);
      const missingLabels = departmentLabels.filter((label) => !existingLabels.includes(label));

      // Crée les départements manquants
      const newDepartments = await Promise.all(
        missingLabels.map((label) =>
          tx.department.create({
            data: {
              label,
              icon: "default-icon", // ← valeur par défaut obligatoire
            },
            select: { id: true, label: true, icon: true },
          }),
        ),
      );
      

      const allDepartments = [...existingDepartments, ...newDepartments];

      // Création des relations organisation-département
      await tx.organizationDepartment.createMany({
        data: allDepartments.map((dept) => ({
          organisationId: organization.id, // Assurez-vous que c'est bien `organizationId` dans votre modèle
          departmentId: dept.id,
        })),
      });

      return { user, organization };
    });

    // Préparer l'email HTML
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

    // Envoie l'email avec Inngest
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
        message: "Inscription réussie",
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
