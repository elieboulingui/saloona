import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { auth } from "@/auth"

// GET /api/organizations/[id]/departments - Get all departments for an organization
export async function GET(request: Request) {
  
  try {

    // Récupérer tous les départements de l'organisation
    const departments = await prisma.department.findMany({
      orderBy: {
        label : "asc"
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des départements" },
      { status: 500 },
    )
  }
}
