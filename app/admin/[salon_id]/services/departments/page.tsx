import { Suspense } from "react"
import DepartmentsClient from "../components/departments-client"
import { prisma } from "@/utils/prisma"

export default async function ServicesAdminPage({ params }: { params: Promise<{ salon_id: string }> }) {
  const { salon_id: salonId } = await params

  const organization = await prisma.organization.findUnique({
    where: { id: salonId },
    include: {
      departments: {
        include: {
          department: true, // important pour récupérer label, icon, etc.
        },
      },
    },
  })

  if (!organization) {
    return <div>Organisation introuvable</div>
  }

  const formattedDepartments = organization.departments.map((d) => ({
    id: d.id,
    departmentId: d.departmentId,
    organisationId: d.organisationId,
    department: {
      id: d.department.id,
      label: d.department.label,
      icon: d.department.icon,
    },
  }))

  console.log(formattedDepartments)

  return (
    <div id="departments" className="py-4">
      <Suspense fallback={<div>Chargement des départements...</div>}>
        <DepartmentsClient
          initialDepartments={formattedDepartments}
          salonId={salonId}
        />
      </Suspense>
    </div>
  )
}
