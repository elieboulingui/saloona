import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "./components/admin-dashboard"
import BarberDashboard from "./barder-dashboard"

export default async function AdminPage() {
  const session = await auth()

  // Vérifier le rôle de l'utilisateur
  if (session?.user?.role === "ADMIN") {
    return <AdminDashboard />
  } else if (session?.user?.role === "BARBER") {
    return <BarberDashboard />
  } else {
    redirect("/")
  }
}

