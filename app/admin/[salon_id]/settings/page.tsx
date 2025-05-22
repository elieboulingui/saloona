import { Suspense } from "react"
import { prisma } from "@/utils/prisma"
import SettingsPageClient from "./components/setting-page-client"


export default async function SettingsAdminPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const { salon_id: salonId } = await params
  
  return (
    <div className="container mx-auto max-w-5xl">
    
      <Suspense fallback={<div>Chargement des services...</div>}>
        <SettingsPageClient salonId={salonId} />
      </Suspense>
    </div>
  )
}
