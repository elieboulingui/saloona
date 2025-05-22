import { NextResponse } from 'next/server'
import { prisma } from '@/utils/prisma'

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

        const { departmentIds } = await req.json()

        if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
            return NextResponse.json(
                { error: "Aucun département fourni" },
                { status: 400 }
            )
        }

        // Vérification des départements existants dans la base de données
        const validDepartments = await prisma.department.findMany({
            where: {
                id: { in: departmentIds },
            },
            select: { id: true },
        })

        // Récupération des IDs des départements valides
        const validIds = validDepartments.map((dep) => dep.id)
        // Départements invalides (non trouvés)
        const invalidIds = departmentIds.filter((id) => !validIds.includes(id))

        if (invalidIds.length > 0) {
            return NextResponse.json(
                {
                    error: `Les départements suivants sont invalides : ${invalidIds.join(", ")}`,
                },
                { status: 400 }
            )
        }

        // Créer les départements manquants
        const departmentsToCreate = invalidIds.map(id => ({
            id,                   // ID du département (assuré d'être unique)
            name: `Département ${id}`,  // Nom du département (ici un exemple basique)
            label: `Label de ${id}`,    // Un label pour chaque département (ajouté)
            icon: `icon-${id}`,       // Exemple d'icône associée (à ajuster selon tes besoins)
        }))

        // Si des départements manquent, les créer
        if (departmentsToCreate.length > 0) {
            await prisma.department.createMany({
                data: departmentsToCreate,
                skipDuplicates: true, // Ignore les départements déjà existants
            })
        }

        // Supprimer les anciens liens entre l'organisation et les départements
        await prisma.organizationDepartment.deleteMany({
            where: { organisationId: salonId },
        })

        // Créer les nouveaux liens entre l'organisation et les départements
        const createdDepartments = await Promise.all(
            validIds.map((depId) =>
                prisma.organizationDepartment.create({
                    data: {
                        organisationId: salonId,
                        departmentId: depId,
                    },
                })
            )
        )

        return NextResponse.json({ message: 'Départements ajoutés avec succès', data: createdDepartments })
    } catch (error) {
        console.error("Erreur dans l'API:", error)
        return NextResponse.json(
            { error: "Erreur serveur lors de l'ajout des départements" },
            { status: 500 }
        )
    }
}
