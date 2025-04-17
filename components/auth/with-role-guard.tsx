"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

type RoleGuardProps = {
  children: ReactNode
  allowedRoles: string[]
  userId?: string // Optionnel, pour vérifier si l'utilisateur accède à son propre profil
}

export function WithRoleGuard({ children, allowedRoles, userId }: RoleGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Si l'authentification est terminée et que l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/connexion")
      return
    }

    // Si l'utilisateur est connecté mais n'a pas le rôle requis
    if (status === "authenticated" && session?.user) {
      const hasPermission = allowedRoles.includes(session.user.role)

      // Vérification supplémentaire pour les BARBER accédant aux profils utilisateurs
      const isAccessingOwnProfile = session.user.role === "BARBER" && userId && userId === session.user.id

      if (!hasPermission && !isAccessingOwnProfile) {
        router.push("/")
      }
    }
  }, [status, session, router, allowedRoles, userId])

  // Afficher un loader pendant la vérification
  if (status === "loading" || (status === "authenticated" && !allowedRoles.includes(session?.user?.role || ""))) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

