import { redirect } from "next/navigation"
import AdminDashboard from "./components/admin-dashboard"
import BarberDashboard from "./barder-dashboard"
import { checkOrganizationMembership } from "@/lib/check-organization-membership"

export default async function AdminPage({ params }: { params: Promise<{ salon_id: string }> }) {
  
  // Vérifier si l'utilisateur est membre de l'organisation
  const {salon_id} = await params
  const result = await checkOrganizationMembership(salon_id)

  // Vérifier le rôle de l'utilisateur
  if (result.role === "ADMIN" ) {
    return <AdminDashboard salonId={salon_id} />
  } else if (result.role === "BARBER") {
    return <BarberDashboard salonId={salon_id} />
  } else {
    redirect("/")
  }

}

