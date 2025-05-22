"use client"

import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { MapPin } from "lucide-react"
import Image from "next/image"
import type { OrganizationDetails } from "@/types/organization"

interface OrganizationProps {
  organization: OrganizationDetails
  onClick?: () => void
}

const CardOrganization = ({ organization, onClick }: OrganizationProps) => {

  return (
    <div className="w-full" onClick={onClick}>
      <Card key={organization.id} className="overflow-hidden gap-0 border-none shadow-sm cursor-pointer py-0">
        <div className="relative h-48 w-full">
          <Image
            src={organization.imageCover || "/placeholder.svg"}
            alt={organization.name}
            fill
            className="object-cover"
          />
          {organization.logo && (
            <div className="absolute top-2 left-2 h-12 w-12 rounded-full overflow-hidden bg-white p-1">
              <Image
                src={organization.logo || "/placeholder.svg"}
                alt={`${organization.name} logo`}
                width={48}
                height={48}
                className="object-cover rounded-full"
              />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center mb-1">
            <h3 className="font-bold text-sm">{organization.name}</h3>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            <MapPin className="h-3 w-3 inline mr-1" />
            {organization.address}
          </div>
          <div className="flex flex-wrap gap-1">
            {organization.departments.map((department, index) => (
              <Badge key={index} variant="outline" className="bg-white text-black border-black rounded-full">
                {department.label}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CardOrganization