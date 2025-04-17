import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MobileAdminNav } from "./components/mobile-admin-nav"
import { checkOrganizationMembership } from "@/lib/check-organization-membership"

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { salon_id: string }
}>) {
  const session = await auth()
  if (!session?.user) return redirect("/connexion")

  // Vérifier si l'utilisateur a le rôle ADMIN ou BARBER
  if (!["ADMIN", "BARBER"].includes(session?.user.role)) {
    redirect("/")
  }

  // Vérifier si l'utilisateur est membre de l'organisation
  await checkOrganizationMembership(params.salon_id)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Main content */}
      <main className="flex-1 pb-16 container mx-auto max-w-6xl">{children}</main>

      {/* Mobile navigation */}
      <MobileAdminNav />
    </div>
  )
}
