import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    
  try {

    // Otherwise, fetch all departments
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        label: true,
        icon: true,
      },
      orderBy: {
        label: "asc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des départements" },
      { status: 500 },
    )
  }
}
