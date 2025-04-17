"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, MapPin, Star, Filter, ArrowLeft, Clock, ChevronRight, Heart, Scissors, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Types
interface Salon {
  id: string
  name: string
  address: string
  district: string
  rating: number
  reviewCount: number
  distance?: string
  specialties: string[]
  image: string
  isOpen: boolean
  isFeatured?: boolean
  openingTime: string
  closingTime: string
  priceRange: string
}

// Données de démonstration
const MOCK_SALONS: Salon[] = [
  {
    id: "1",
    name: "Dreads In Gabon",
    address: "Kinguele Descente Eglise Universelle",
    district: "Libreville",
    rating: 4.8,
    reviewCount: 124,
    distance: "1.2 km",
    specialties: ["Dreads", "Locks", "Tresses"],
    image: "/dreads-background.png",
    isOpen: true,
    isFeatured: true,
    openingTime: "09:00",
    closingTime: "19:00",
    priceRange: "$$",
  },
  {
    id: "2",
    name: "Afro Style",
    address: "Boulevard Triomphal",
    district: "Libreville",
    rating: 4.5,
    reviewCount: 89,
    distance: "2.5 km",
    specialties: ["Afro", "Coupe", "Coloration"],
    image: "/placeholder.svg?height=200&width=300&text=Afro+Style",
    isOpen: true,
    openingTime: "08:30",
    closingTime: "20:00",
    priceRange: "$$$",
  },
  {
    id: "3",
    name: "Braids & Beauty",
    address: "Quartier Louis",
    district: "Libreville",
    rating: 4.7,
    reviewCount: 102,
    distance: "3.8 km",
    specialties: ["Tresses", "Tissage", "Perruques"],
    image: "/placeholder.svg?height=200&width=300&text=Braids+Beauty",
    isOpen: false,
    openingTime: "10:00",
    closingTime: "18:00",
    priceRange: "$$",
  },
  {
    id: "4",
    name: "Natural Hair Studio",
    address: "Avenue de la Liberté",
    district: "Owendo",
    rating: 4.9,
    reviewCount: 156,
    distance: "5.2 km",
    specialties: ["Naturel", "Soins", "Coupe"],
    image: "/placeholder.svg?height=200&width=300&text=Natural+Hair",
    isOpen: true,
    isFeatured: true,
    openingTime: "09:00",
    closingTime: "19:30",
    priceRange: "$$$",
  },
  {
    id: "5",
    name: "Locks & Waves",
    address: "Rue des Palmiers",
    district: "Akanda",
    rating: 4.6,
    reviewCount: 78,
    distance: "7.1 km",
    specialties: ["Locks", "Waves", "Fade"],
    image: "/placeholder.svg?height=200&width=300&text=Locks+Waves",
    isOpen: true,
    openingTime: "08:00",
    closingTime: "18:00",
    priceRange: "$$",
  },
  {
    id: "6",
    name: "Élégance Coiffure",
    address: "Centre-ville",
    district: "Libreville",
    rating: 4.4,
    reviewCount: 65,
    distance: "2.8 km",
    specialties: ["Chignon", "Mariage", "Événement"],
    image: "/placeholder.svg?height=200&width=300&text=Elegance",
    isOpen: false,
    openingTime: "09:30",
    closingTime: "19:00",
    priceRange: "$$$",
  },
]

// Catégories de filtres
const FILTER_CATEGORIES = [
  { id: "all", name: "Tous", icon: <Scissors className="h-4 w-4" /> },
  { id: "nearby", name: "À proximité", icon: <MapPin className="h-4 w-4" /> },
  { id: "open", name: "Ouverts", icon: <Clock className="h-4 w-4" /> },
  { id: "featured", name: "En vedette", icon: <Sparkles className="h-4 w-4" /> },
  { id: "dreads", name: "Dreads", icon: <Scissors className="h-4 w-4" /> },
  { id: "braids", name: "Tresses", icon: <Scissors className="h-4 w-4" /> },
]

export default function SalonsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [salons, setSalons] = useState<Salon[]>([])

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setSalons(MOCK_SALONS)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filtrer les salons
  const filteredSalons = salons.filter((salon) => {
    // Filtre de recherche
    const matchesSearch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtres de catégorie
    let matchesFilter = true
    if (activeFilter === "nearby") {
      matchesFilter = Number.parseFloat(salon.distance?.replace(" km", "") || "999") < 5
    } else if (activeFilter === "open") {
      matchesFilter = salon.isOpen
    } else if (activeFilter === "featured") {
      matchesFilter = salon.isFeatured === true
    } else if (activeFilter === "dreads") {
      matchesFilter = salon.specialties.some(
        (s) => s.toLowerCase().includes("dreads") || s.toLowerCase().includes("locks"),
      )
    } else if (activeFilter === "braids") {
      matchesFilter = salon.specialties.some((s) => s.toLowerCase().includes("tresse"))
    }

    return matchesSearch && matchesFilter
  })

  // Gérer les favoris
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
     

      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-white font-bold text-xl">Salons de Coiffure</h1>
            <p className="text-white/80 text-xs">Trouvez le salon parfait pour vous</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white" onClick={() => {}}>
          <Filter className="h-5 w-5" />
        </motion.button>
      </header>

      <main className="flex-1 px-4 py-4 overflow-auto">
        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un salon..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtres horizontaux */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {FILTER_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(category.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium",
                activeFilter === category.id
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200",
              )}
            >
              {category.icon}
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Liste des salons */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
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
        ) : filteredSalons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Scissors className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun salon trouvé</p>
            <p className="text-sm text-center mb-4">Essayez de modifier vos critères de recherche</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setActiveFilter("all")
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence>
              {filteredSalons.map((salon) => (
                <motion.div
                  key={salon.id}
                  variants={itemVariants}
                  layout
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/salon/${salon.id}`)}
                >
                  <Card className="overflow-hidden border-none shadow-sm py-0">
                    <div className="relative h-40 w-full">
                      <Image src={"/placeholder.svg"} alt={salon.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Badge ouvert/fermé */}
                      <Badge
                        className={cn(
                          "absolute top-2 left-2",
                          salon.isOpen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600",
                        )}
                      >
                        {salon.isOpen ? "Ouvert" : "Fermé"}
                      </Badge>

                      {/* Bouton favoris */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "absolute top-2 right-2 p-2 rounded-full",
                          favorites.includes(salon.id) ? "bg-red-500 text-white" : "bg-white/80 text-gray-700",
                        )}
                        onClick={(e) => toggleFavorite(salon.id, e)}
                      >
                        <Heart className={cn("h-4 w-4", favorites.includes(salon.id) ? "fill-white" : "")} />
                      </motion.button>

                      {/* Informations en bas de l'image */}
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <h3 className="font-bold text-lg">{salon.name}</h3>
                        <div className="flex items-center text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{salon.district}</span>
                          {salon.distance && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{salon.distance}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                          <span className="font-medium">{salon.rating}</span>
                          <span className="text-gray-500 text-sm ml-1">({salon.reviewCount})</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {salon.openingTime} - {salon.closingTime}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {salon.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="text-gray-700">
                          <span className="font-medium">{salon.priceRange}</span>
                          <span className="text-gray-400 text-sm"> • Prix moyen</span>
                        </div>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">
                          Réserver
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
