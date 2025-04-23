"use client"
import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, MapPin, Scissors, User, LogIn, Grid } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import Link from "next/link"

// Types
export interface Organization {
  id: string
  name: string
  logo: string | null
  imageCover: string | null
  departments: { label: string }[] // Changed to match the new response
  address: string
  verificationStatus: string
  OrganizationAvailability:
  | {
    openingTime: number
    closingTime: number
  }[]
  | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function OrganizationsPage() {

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const { data: organizations, error, isLoading } = useSWR<Organization[]>("/api/organizations", fetcher)

  const { data: departments } = useSWR<{ id: string; label: string; icon: string }[]>("/api/departments", fetcher)

  const filteredOrganizations = organizations?.filter((organization) => {
    const matchesSearch = organization.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment
      ? organization.departments.some((dept) => dept.label.toLowerCase() === selectedDepartment.toLowerCase())
      : true
    return matchesSearch && matchesDepartment
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-100">
      {/* Header */}
      <header className="bg-amber-500 sticky top-0 z-10">
        <div className="py-2 px-4 container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-black.png"
                alt="Saloona Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
              {/* Barre de recherche */}
              <div className="relative max-w-md mx-auto hidden md:block ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un salon..."
                  className="pl-10 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={"/connexion"}>
                <Button variant="outline" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                  Connexion
                </Button>
              </Link>
              <Link href={"/landing"}>
                <Button className="bg-white hidden md:flex text-amber-500 hover:bg-white/90">
                  <Scissors className="h-4 w-4 mr-2" />
                  Je suis un salon
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Department filters */}
      <div className="bg-white py-2 border-b border-gray-300">
        <div className="container mx-auto max-w-6xl overflow-x-auto">
          <div className="flex gap-4 pb-2">
            <div
              className={`flex flex-col items-center gap-2 p-2 cursor-pointer min-w-[80px] ${selectedDepartment === null ? "text-amber-500" : "text-gray-500"}`}
              onClick={() => setSelectedDepartment(null)}
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <Grid className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Tous</span>
            </div>

            {departments?.map((dept) => (
              <div
                key={dept.id}
                className={`flex flex-col items-center gap-2 p-2 cursor-pointer min-w-[80px] ${selectedDepartment === dept.label ? "text-amber-500" : "text-gray-500"}`}
                onClick={() => setSelectedDepartment(dept.label)}
              >
                <div className="bg-gray-100 p-2 rounded-full">
                  <Image
                    src={`/${dept.icon}` || "/placeholder.svg"}
                    alt={dept.label}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </div>
                <span className="text-xs font-medium text-center">{dept.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 overflow-auto container mx-auto max-w-6xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-none">
                <Skeleton className="h-40 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
          <motion.div
            className="grid lg:grid-cols-3 grid-cols-1 gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredOrganizations.map((organization) => (
                <motion.div
                  key={organization.id}
                  variants={itemVariants}
                  layout
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/salon/${organization.id}`)}
                >
                  <Card className="overflow-hidden border-1 shadow-none rounded-sm bg-white py-0">
                    <div className="relative h-40 w-full">
                      <Image
                        src={organization.imageCover || "/placeholder.svg"}
                        alt={organization.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {organization.logo && (
                        <div className="absolute top-2 left-2 h-16 w-16 rounded-full overflow-hidden">
                          <Image
                            src={organization.logo || "/placeholder.svg"}
                            alt={`${organization.name} logo`}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      )}
                      {/* Informations en bas de l'image */}
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <h3 className="font-bold text-lg">{organization.name}</h3>
                        <div className="flex items-center text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{organization.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-500 text-sm">
                          {organization.OrganizationAvailability && (
                            <span>
                              {formatTime(organization.OrganizationAvailability[0].openingTime)}-{" "}
                              {formatTime(organization.OrganizationAvailability[0].closingTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {organization.departments.map((department, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {department.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Search className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun salon trouvé</p>
            <p className="text-sm text-center mb-4">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </main>
    </div>
  )
}
