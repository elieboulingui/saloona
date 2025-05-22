// /app/api/get-info-organisation/[id]/route.ts

import { prisma } from "@/utils/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const {id : organizationId} = await params

    if (!organizationId) {
      return NextResponse.json({ error: "Missing organization id" }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        departments: true, // on inclut les départements
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Error fetching organization info:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching organization info" },
      { status: 500 }
    )
  }
}
