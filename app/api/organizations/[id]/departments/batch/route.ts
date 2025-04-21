import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"

// POST: Ajouter plusieurs départements en une seule requête
export async function POST(request: Request,
    { params }: { params: Promise<{ id: string }> }
){
    try {

        const { id: organizationId } = await params
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const { departments } = await request.json()

        // Vérifier si l'utilisateur est administrateur de l'organisation
        const membership = await prisma.userOrganization.findFirst({
            where: {
                organizationId,
                userId: session.user.id,
                role: "ADMIN",
            },
        })

        if (!membership) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier cette organisation" }, { status: 403 })
        }

        // Vérifier si les départements sont fournis
        if (!departments || !Array.isArray(departments) || departments.length === 0) {
            return NextResponse.json({ error: "Aucun département fourni" }, { status: 400 })
        }

        // Ajouter le department dans organizationDepartment



    } catch (error) {
        console.error("Erreur lors de l'ajout des départements:", error)
        return NextResponse.json({ error: "Erreur lors de l'ajout des départements" }, { status: 500 })
    }
}
