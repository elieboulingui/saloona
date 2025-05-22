import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server"


// DELETE: Supprimer un département
export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string , departmentId : string}> }
  ) {
  try {
  
    const { id : organizationId, departmentId  } = await params

    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }


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

    // Vérifier si le département existe et appartient à l'organisation
    const department = await prisma.organizationDepartment.findUnique({
      where: {
        id: departmentId,
      },
    })

    if (!department) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 })
    }

    // Supprimer le département (les services associés seront également supprimés grâce à la cascade)
    await prisma.organizationDepartment.delete({
      where: {
        id: departmentId,
      },
    })

    revalidatePath(`/admin/${organizationId}/services/departments`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du département" }, { status: 500 })
  }
}
