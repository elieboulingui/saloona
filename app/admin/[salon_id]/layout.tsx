import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MobileAdminNav } from "./components/mobile-admin-nav"

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ salon_id: string }>
}>) {

  const session = await auth()
  if (!session?.user) return redirect("/connexion")

  const {salon_id} = await params
  
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Main content */}
      <main className="flex-1 pb-16 container mx-auto max-w-6xl">{children}</main>

      {/* Mobile navigation */}
      <MobileAdminNav salon_id={salon_id}/>
    </div>
  )
}
