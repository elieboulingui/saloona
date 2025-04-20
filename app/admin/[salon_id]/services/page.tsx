import { Suspense } from "react"
import { ServicesClient } from "./components/service-client"
import { prisma } from "@/utils/prisma"
import { departments } from "@/data"

export default async function ServicesAdminPage({ params }: { params:Promise<{ salon_id: string }>}) {

  const {salon_id : salonId } = await params

  // Récupérer les services de l'organisation côté serveur
  const services = await prisma.service.findMany({
    where: {
      organizationId: salonId,
    },
    include: {
      department: true,
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Services</h1>
        <p className="text-gray-500">Gérez les services proposés par votre salon</p>
      </div>

      <Suspense fallback={<div>Chargement des services...</div>}>
        <ServicesClient initialServices={services} departments={departments} salonId={salonId} />
      </Suspense>
    </div>
  )
}
