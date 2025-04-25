"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, MenuIcon, X, ChevronRight, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRecentlyViewedStore } from "@/store/recently-viewed-store"
import type { Organization } from "@/types/organization"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import CardOrganization from "@/components/card-organization"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [isFilterSticky, setIsFilterSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const recommendationsRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  const { data: organizations, error, isLoading } = useSWR<Organization[]>("/api/organizations", fetcher)
  const { data: departments } = useSWR<{ id: string; label: string; icon: string }[]>("/api/departments", fetcher)
  const recentlyViewed = useRecentlyViewedStore((state) => state.items)

  const filteredOrganizations = organizations?.filter((organization) => {
    // Filtre par terme de recherche
    const matchesSearch = organization.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre par département sélectionné
    const matchesDepartment = selectedDepartment
      ? organization.departments.some((dept) => dept.id === selectedDepartment)
      : true

    return matchesSearch && matchesDepartment
  })

  // Gérer le scroll pour rendre le filtre sticky
  useEffect(() => {
    const handleScroll = () => {
      if (recommendationsRef.current && filterRef.current) {
        const recommendationsTop = recommendationsRef.current.getBoundingClientRect().top
        setIsFilterSticky(recommendationsTop <= 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fonction pour naviguer vers un salon et l'ajouter aux récemment consultés
  const handleOrganizationClick = (organization: Organization) => {
    useRecentlyViewedStore.getState().addItem(organization)
    router.push(`/salon/${organization.id}`)
  }

  // Fonction pour faire défiler jusqu'à la section des recommandations
  const scrollToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

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

  // Compteur de rendez-vous (simulé)
  const [appointmentCount, setAppointmentCount] = useState(516646)
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointmentCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-white py-4 px-4 md:px-0 container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo-black.png" alt="Saloona Logo" width={120} height={50} className="h-10 w-auto" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden hover:cursor-pointer md:flex rounded-full py-4 px-6">
            Se connecter
          </Button>
          <Button className="hidden md:flex hover:cursor-pointer bg-amber-500 hover:bg-amber-600  rounded-full py-4 px-6">
            Je suis un professionnel
          </Button>

          {/* Menu mobile */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden border-1 rounded-full p-4 bg-amber-500">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Pour les clients</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Button variant="link" className="w-full justify-between text-purple-600">
                    Connectez-vous ou inscrivez-vous
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="link" className="w-full justify-between">
                    Téléchargez l'app
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="link" className="w-full justify-between">
                    Aide et assistance
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="link" className="w-full justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">🇫🇷</span> français
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8">
                  <Button variant="outline" className="w-full justify-between">
                    Pour les professionnels
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-100 to-red-100 py-12 md:py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-6xl font-bold mb-8 md:mb-12 max-w-4xl">
            Réservez des prestations de beauté et de bien-être près de chez vous
          </h1>

          {/* Grille de départements au lieu de la barre de recherche */}
          <div className="grid grid-cols-3 md:grid-cols-auto md:flex md:flex-wrap gap-3 max-w-6xl">
            {departments?.map((dept) => (
              <motion.div
                key={dept.id}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-xl p-4 lg:w-36 w-auto flex flex-col items-center justify-center shadow-sm cursor-pointer"
                onClick={() => {
                  setSelectedDepartment(dept.id)
                  scrollToRecommendations()
                }}
              >
                <div className="bg-gray-100 p-3 rounded-full mb-2">
                  <Image
                    src={`/${dept.icon}` || "/placeholder.svg"}
                    alt={dept.label}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                </div>
                <span className="text-xs font-medium text-center">{dept.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Appointment Counter */}
          <div className="mt-8">
            <p className="text-md font-light md:text-xl">
              <span className="font-bold">{appointmentCount.toLocaleString()}</span> rendez-vous pris aujourd'hui
            </p>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-8 px-4 md:px-8 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">Récemment consulté</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.slice(0, 3).map((organization) => (
                <CardOrganization
                  key={organization.id}
                  organization={organization}
                  onClick={() => handleOrganizationClick(organization)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommendations Section */}
      <section ref={recommendationsRef} className="py-8 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Recommandés</h2>

          {/* Organizations Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-none">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6"
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
                    onClick={() => handleOrganizationClick(organization)}
                  >
                    <CardOrganization
                      organization={organization}
                      onClick={() => handleOrganizationClick(organization)}
                    />
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
        </div>
      </section>
    </div>
  )
}
