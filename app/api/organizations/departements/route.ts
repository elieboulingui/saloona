import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const salonId = searchParams.get("id")

        if (!salonId) {
            return NextResponse.json(
                { error: "Paramètre 'id' manquant dans l'URL" },
                { status: 400 }
            )
        }

        // Récupération des labels depuis le body
        const { departmentLabels } = await req.json()

        if (!Array.isArray(departmentLabels) || departmentLabels.length === 0) {
            return NextResponse.json(
                { error: "Aucun label de département fourni" },
                { status: 400 }
            )
        }

        console.log("Labels de départements reçus :", departmentLabels)

        // Rechercher les départements existants
        let validDepartments = await prisma.department.findMany({
            where: {
                label: { in: departmentLabels },
            },
            select: { id: true, label: true },
        })

        const validNames = validDepartments.map((dep) => dep.label)

        // Identifier les labels manquants
        const missingLabels = departmentLabels.filter(
            (label: string) => !validNames.includes(label)
        )

        // Créer les départements manquants
        if (missingLabels.length > 0) {
            const createdDepartments = await Promise.all(
                missingLabels.map((label: string) =>
                    prisma.department.create({
                        data: {
                            label,
                            icon: "", // 🔁 valeur par défaut obligatoire
                        },
                        select: { id: true, label: true },
                    })
                )
            )

            // Ajouter les nouveaux départements à la liste existante
            validDepartments = [...validDepartments, ...createdDepartments]
        }

        const validIds = validDepartments.map((dep) => dep.id)

        // Supprimer les anciens liens avec cette organisation
        await prisma.organizationDepartment.deleteMany({
            where: { organisationId: salonId },
        })

        // Créer les nouveaux liens
        const createdLinks = await Promise.all(
            validIds.map((depId) =>
                prisma.organizationDepartment.create({
                    data: {
                        organisationId: salonId,
                        departmentId: depId,
                    },
                    include: {
                        department: true,
                    },
                })
            )
        )

        return NextResponse.json({
            message: "Départements ajoutés avec succès",
            data: createdLinks,
        })
    } catch (error) {
        console.error("Erreur dans l'API:", error)
        return NextResponse.json(
            { error: "Erreur serveur lors de l'ajout des départements" },
            { status: 500 }
        )
    }
}
