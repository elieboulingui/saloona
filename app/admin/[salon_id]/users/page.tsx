import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UsersPageClient from "./components/users-page-client"
import { checkOrganizationMembership } from "@/lib/check-organization-membership"

export default async function UsersPage({ params }: { params: Promise<{ salon_id: string }> }) {

    const {salon_id} = await params
    const result = await checkOrganizationMembership(salon_id)
  
    // Vérifier le rôle de l'utilisateur
    if (result.role === "BARBER") {
      redirect("/admin/"+ salon_id)
    } else if (result.role ==="CLIENT") {
      redirect("/")
    }

    return <UsersPageClient salonId={salon_id}/>

}

