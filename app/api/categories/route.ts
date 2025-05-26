import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("id");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId manquant" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erreur API /categories:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
