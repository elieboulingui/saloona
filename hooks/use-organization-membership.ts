"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useOrganizationMembership() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)

  const organizationId = params?.salon_id as string

  useEffect(() => {
    async function checkMembership() {
      if (status === "loading") return

      if (status === "unauthenticated") {
        router.push("/")
        return
      }

      if (!organizationId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/organizations/${organizationId}/membership`)
        const data = await response.json()

        setIsMember(data.isMember)

        if (!data.isMember) {
          router.push("/")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'appartenance:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkMembership()
  }, [organizationId, router, status])

  return { isLoading, isMember }
}
