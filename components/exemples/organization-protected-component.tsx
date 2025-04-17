"use client"

import { useOrganizationMembership } from "@/hooks/use-organization-membership"

export default function OrganizationProtectedComponent() {
  const { isLoading, isMember } = useOrganizationMembership()

  if (isLoading) {
    return <div className="p-4 text-center">Chargement...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contenu protégé</h2>
      <p>Ce contenu n'est visible que par les membres de l'organisation.</p>
    </div>
  )
}
