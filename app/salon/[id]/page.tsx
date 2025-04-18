"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Share2,
  Calendar,
  Scissors,
  Info,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  User,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  ListOrdered,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  coverImage?: string
  isOpen: boolean
  isFeatured?: boolean
  openingTime: string
  closingTime: string
  priceRange: string
  description: string
  phoneNumber: string
  website?: string
  departments: Department[]
}

interface Department {
  id: string
  name: string
  icon: string
  services: Service[]
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  departmentId: string
}

interface Stylist {
  id: string
  name: string
  role: string
  image: string
  rating: number
  reviewCount: number
}

interface Review {
  id: string
  userName: string
  userImage?: string
  rating: number
  date: string
  comment: string
}

interface CartItem {
  serviceId: string
  serviceName: string
  price: number
  duration: number
}

// Données de démonstration
const MOCK_SALON: Salon = {
  id: "1",
  name: "Dreads In Gabon",
  address: "Kinguele Descente Eglise Universelle",
  district: "Libreville",
  rating: 4.8,
  reviewCount: 124,
  distance: "1.2 km",
  specialties: ["Dreads", "Locks", "Tresses"],
  image: "/dreads-background.png",
  coverImage: "/dreads-background.png",
  isOpen: true,
  isFeatured: true,
  openingTime: "09:00",
  closingTime: "19:00",
  priceRange: "$",
  description:
    "Spécialiste des dreads locks et coiffures afro, notre salon offre des services de qualité dans une ambiance chaleureuse. Notre équipe expérimentée vous accompagne pour sublimer votre style naturel.",
  phoneNumber: "+241 66 07 90 95",
  website: "www.dreadsingabon.com",
  departments: [
    {
      id: "d1",
      name: "Dreads",
      icon: "/placeholder.svg?height=50&width=50&text=👩‍🦱",
      services: [
        {
          id: "s1",
          name: "Démarrage Dreads",
          description: "Création de nouvelles dreads locks à partir de cheveux naturels.",
          price: 15000,
          duration: 120,
          departmentId: "d1",
        },
        {
          id: "s2",
          name: "Entretien & Reprise",
          description: "Maintenance régulière et reprise des racines.",
          price: 10000,
          duration: 60,
          departmentId: "d1",
        },
        {
          id: "s3",
          name: "Réparation",
          description: "Solutions pour dreads abîmées ou cassées.",
          price: 8000,
          duration: 45,
          departmentId: "d1",
        },
      ],
    },
    {
      id: "d2",
      name: "Coloration",
      icon: "/placeholder.svg?height=50&width=50&text=🎨",
      services: [
        {
          id: "s4",
          name: "Coloration Dreads",
          description: "Teintures et colorations adaptées aux dreads.",
          price: 12000,
          duration: 90,
          departmentId: "d2",
        },
        {
          id: "s5",
          name: "Coloration Naturelle",
          description: "Coloration avec des produits naturels.",
          price: 15000,
          duration: 120,
          departmentId: "d2",
        },
      ],
    },
    {
      id: "d3",
      name: "Coupe",
      icon: "/placeholder.svg?height=50&width=50&text=✂️",
      services: [
        {
          id: "s6",
          name: "Coupe Entretien",
          description: "Coupe d'entretien pour vos dreads.",
          price: 5000,
          duration: 30,
          departmentId: "d3",
        },
        {
          id: "s7",
          name: "Coupe Stylisée",
          description: "Coupe stylisée pour un look unique.",
          price: 8000,
          duration: 45,
          departmentId: "d3",
        },
      ],
    },
    {
      id: "d4",
      name: "Soins",
      icon: "/placeholder.svg?height=50&width=50&text=💆‍♀️",
      services: [
        {
          id: "s8",
          name: "Soin Hydratant",
          description: "Soin hydratant pour dreads.",
          price: 7000,
          duration: 60,
          departmentId: "d4",
        },
        {
          id: "s9",
          name: "Massage Crânien",
          description: "Massage du cuir chevelu relaxant.",
          price: 6000,
          duration: 30,
          departmentId: "d4",
        },
      ],
    },
    {
      id: "d5",
      name: "Extensions",
      icon: "/placeholder.svg?height=50&width=50&text=🧶",
      services: [
        {
          id: "s10",
          name: "Extensions Dreads",
          description: "Ajout de longueur à vos dreads.",
          price: 18000,
          duration: 150,
          departmentId: "d5",
        },
      ],
    },
  ]
}

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("services")
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setSalon(MOCK_SALON)
      setIsLoading(false)
      // Sélectionner le premier département par défaut
      if (MOCK_SALON.departments.length > 0) {
        setSelectedDepartment(MOCK_SALON.departments[0].id)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  // Gérer les favoris
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // Gérer l'expansion des services
  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  // Ajouter un service au panier
  const addToCart = (service: Service) => {
    setCart([
      ...cart,
      {
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
      },
    ])
  }

  // Supprimer un service du panier
  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter((item) => item.serviceId !== serviceId))
  }

  // Vérifier si un service est dans le panier
  const isInCart = (serviceId: string) => {
    return cart.some((item) => item.serviceId === serviceId)
  }

  // Calculer le total du panier
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0)
  }

  // Calculer la durée totale
  const calculateTotalDuration = () => {
    return cart.reduce((total, item) => total + item.duration, 0)
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Formater la durée en heures et minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
  }

  // Procéder à la réservation
  const proceedToBooking = () => {
    router.push(`/salons/${params.id}/booking`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-gray-50">

        {/* Header skeleton */}
        <Skeleton className="h-64 w-full" />

        <div className="px-4 py-4">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />

          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-1/2 rounded-full" />
            <Skeleton className="h-10 w-1/2 rounded-full" />
          </div>

          <Skeleton className="h-32 w-full mb-4" />

          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50 p-4">
        <div className="text-center">
          <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Salon non trouvé</h2>
          <p className="text-gray-500 mb-4">Le salon que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/salons">
            <Button className="bg-amber-500 hover:bg-amber-600">Retour à la liste des salons</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
     
      {/* Image de couverture avec header flottant */}
      <div className="relative h-64 container mx-auto max-w-6xl lg:mt-3 mt-0">
        <Image src={"/marley.jpg"} alt={salon.name} fill className="object-cover lg:rounded-2xl rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Header flottant */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <Link href="/">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/30 p-3 rounded-full backdrop-blur-sm">
              <Home className="h-5 w-5 text-white" />
            </motion.div>
          </Link>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="bg-black/30 p-3 rounded-full backdrop-blur-sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: salon.name,
                    text: `Découvrez ${salon.name} - ${salon.description.substring(0, 50)}...`,
                    url: window.location.href,
                  })
                }
              }}
            >
              <Share2 className="h-5 w-5 text-white" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className={cn("p-3 rounded-full backdrop-blur-sm bg-white")}
              onClick={toggleFavorite}
            >
              <Phone className="h-5 w-5 text-black" />
            </motion.button>
          </div>
        </div>

        {/* Informations en bas de l'image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl font-bold mb-1">{salon.name}</h1>
          <div className="flex items-center text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {salon.address}, {salon.district}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
              <span className="font-medium">{salon.rating}</span>
              <span className="text-white/80 text-sm ml-1">({salon.reviewCount})</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {salon.openingTime} - {salon.closingTime}
              </span>
            </div>
            <Badge className={cn(salon.isOpen ? "bg-green-500" : "bg-red-500")}>
              {salon.isOpen ? "Ouvert" : "Fermé"}
            </Badge>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 container mx-auto max-w-6xl">
        {/* Boutons d'action */}
        <div className="flex gap-2 mb-6">
          <Button className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-full" onClick={() => setShowCart(true)}>
            <Calendar className="h-4 w-4" />
            Réserver
            {cart.length > 0 && <Badge className="ml-2 bg-white text-amber-500">{cart.length}</Badge>}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-50  rounded-full"
            onClick={() => router.push("/salon/saji/boutique")}
          >
            <ShoppingBasket className="h-4 w-4" />
            Boutique
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-50 rounded-full"
            onClick={() => router.push("/salon/sadji/queue")}
          >
            <ListOrdered className="h-4 w-4" />
            Attente
          </Button>
        </div>
    
        {/* Départements */}
        <div className="mb-6 sticky top-0 z-50 bg-gray-50">
          <h2 className="text-lg font-bold py-2.5 mb-3">Que souhaitez vous faire ?</h2>
          <div className="grid grid-cols-5 gap-2 bg-purple-50 p-3 rounded-xl">
            {salon.departments.map((dept) => (
              <motion.div
                key={dept.id}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer",
                  selectedDepartment === dept.id ? "bg-white shadow-sm" : "bg-white/60",
                )}
                onClick={() => setSelectedDepartment(dept.id)}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
                  <Image
                    src={dept.icon || "/placeholder.svg"}
                    alt={dept.name}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-center">{dept.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="mt-4 space-y-3">
            <AnimatePresence>
              {salon.departments
                .find((dept) => dept.id === selectedDepartment)
                ?.services.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden cursor-pointer transition-all duration-300",
                        expandedService === service.id ? "border-amber-300" : "",
                        isInCart(service.id) ? "border-green-300 bg-green-50" : "",
                      )}
                      onClick={() => toggleServiceExpansion(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold">{service.name}</h3>
                              {isInCart(service.id) && <Badge className="ml-2 bg-green-500">Sélectionné</Badge>}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-600">{service.price.toLocaleString()} FCFA</div>
                            {expandedService === service.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 mt-1" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 mt-1" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedService === service.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 pt-3 border-t border-gray-100"
                            >
                              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                              {isInCart(service.id) ? (
                                <Button
                                  variant="outline"
                                  className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFromCart(service.id)
                                  }}
                                >
                                  <Minus className="mr-2 h-4 w-4" />
                                  Retirer du panier
                                </Button>
                              ) : (
                                <Button
                                  className="w-full bg-amber-500 hover:bg-amber-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addToCart(service)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Ajouter au panier
                                </Button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-3">Informations</h2>

          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Adresse</h3>
                <p className="text-gray-600 text-sm">
                  {salon.address}, {salon.district}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Téléphone</h3>
                <p className="text-gray-600 text-sm">{salon.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Horaires</h3>
                <p className="text-gray-600 text-sm">
                  Tous les jours: {salon.openingTime} - {salon.closingTime}
                </p>
              </div>
            </div>

            {salon.website && (
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Site web</h3>
                  <p className="text-gray-600 text-sm">{salon.website}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal du panier */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl w-full max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

              <h2 className="text-xl font-bold mb-4">Votre sélection</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Votre panier est vide</p>
                  <Button variant="outline" className="mx-auto" onClick={() => setShowCart(false)}>
                    Parcourir les services
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-auto">
                    {cart.map((item) => (
                      <div key={item.serviceId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.serviceName}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{item.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-600">{item.price.toLocaleString()} FCFA</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeFromCart(item.serviceId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-amber-600">{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée totale:</span>
                      <span className="font-medium">{formatDuration(calculateTotalDuration())}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setShowCart(false)}>
                      Continuer
                    </Button>
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={proceedToBooking}>
                      Réserver
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton de réservation flottant */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 rounded-full" onClick={() => setShowCart(true)}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {cart.length} service{cart.length > 1 ? "s" : ""} • {calculateTotal().toLocaleString()} FCFA
          </Button>
        </div>
      )}
    </div>
  )
}
