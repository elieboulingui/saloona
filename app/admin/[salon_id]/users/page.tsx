import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UsersPageClient from "./components/users-page-client"

export default async function UsersPage() {
  const session = await auth()

  // Vérifier si l'utilisateur a le rôle ADMIN
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/calendar") // Rediriger les BARBER vers le calendrier
  }

  return <UsersPageClient />
}

