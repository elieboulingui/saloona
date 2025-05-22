"use client"

import { Suspense, useState, useEffect } from "react"
import { TeamCard } from "./team-card"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamMember {
  id: string
  name: string
  role: string
  image: string | null
  speciality: string | null
}

interface TeamSectionProps {
  organizationId: string
}

function TeamMembersSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full mb-2" />
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

function TeamMembersLoader({ organizationId }: { organizationId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTeamMembers() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/organizations/${organizationId}/users`)

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des membres de l'équipe")
        }

        const data = await response.json()

        // Transformer les données pour correspondre à l'interface TeamMember
        const formattedMembers: TeamMember[] = data.map((user: any) => ({
          id: user.id,
          name: user.name || "Sans nom",
          role: user.speciality || "Coiffeur",
          image: user.image || "/placeholder.svg?height=100&width=100",
          speciality: user.speciality,
        }))

        setMembers(formattedMembers)
      } catch (err) {
        console.error("Erreur:", err)
        setError("Impossible de charger les membres de l'équipe")
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamMembers()
  }, [organizationId])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (isLoading) {
    return <TeamMembersSkeleton />
  }

  if (members.length === 0) {
    return <div className="text-gray-500">Aucun membre d'équipe disponible</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {members.map((member) => (
        <TeamCard
          key={member.id}
          id={member.id}
          name={member.name}
          role={member.role}
          image={member.image || "/placeholder.svg?height=100&width=100"}
        />
      ))}
    </div>
  )
}

export function TeamSection({ organizationId }: TeamSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-8">Équipe</h2>
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembersLoader organizationId={organizationId} />
      </Suspense>
    </div>
  )
}
