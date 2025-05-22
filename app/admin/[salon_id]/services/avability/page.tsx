import { Suspense } from "react"
import AvailabilityClient from "../components/availability-client"

export default async function ServicesAdminPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const { salon_id: salonId } = await params

  return (
    <div id="availability">
        <Suspense fallback={<div>Chargement des disponibilités...</div>}>
            <AvailabilityClient salonId={salonId} />
        </Suspense>
    </div>
  )
}
