import { Suspense } from "react"
import { ServiceDetailsClient } from "./components/service-details-client"
import { prisma } from "@/utils/prisma"
import { notFound } from "next/navigation"
import { departments } from "@/data"

export default async function ServiceDetailsPage({ params }: { params: Promise<{ salon_id: string; id: string }> }) {
  const { salon_id: salonId, id: serviceId } = await params

  // Récupérer les détails du service côté serveur
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
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
  })

  if (!service) {
    notFound()
  }

  // Récupérer tous les rendez-vous pour ce service
  const appointments = await prisma.appointment.findMany({
    where: {
      services: {
        some: {
          serviceId: serviceId,
        },
      },
    },
    include: {
      barber: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  const dashboardData = {
    service,
    appointments,
  }

  return (
    <Suspense fallback={<div>Chargement des détails du service...</div>}>
      <ServiceDetailsClient dashboardData={dashboardData} departments={departments} salonId={salonId} />
    </Suspense>
  )
}
