"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Grid,
  Home,
  ListOrdered,
  MapPin,
  Minus,
  Phone,
  Plus,
  Share2,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCartStore } from "@/store/cart-service-store"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface OrganizationDetails {
  id: string
  name: string
  logo: string | null
  imageCover: string | null
  description: string | null
  departments: { label: string; id: string; icon: string }[]
  services: {
    name: string
    id: string
    image: string
    description: string
    price: string
    durationMin: string
    durationMax: string
    departmentId: string
  }[]
  address: string
  verificationStatus: string
  OrganizationAvailability:
  | {
    openingTime: number
    closingTime: number
    mondayOpen: boolean
    thursdayOpen: boolean
    wednesdayOpen: boolean
    fridayOpen: boolean
    sundayOpen: boolean
    saturdayOpen: boolean
    tuesdayOpen: boolean
  }[]
  | null
}

interface Service {
  name: string
  id: string
  image: string
  description: string
  price: string
  durationMin: string
  durationMax: string
  departmentId: string
}

interface CartItem {
  serviceId: string
  serviceName: string
  price: number
  duration: number
}

export default function OrganizationDetailsPage() {
  const { id } = useParams()
  const { items: cart, addItem, removeItem, total, totalDuration, clearCart } = useCartStore()

  const { data: organization, error, isLoading } = useSWR<OrganizationDetails>(`/api/organizations/${id}`, fetcher)

  const router = useRouter()
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const [showCart, setShowCart] = useState(false)

  // Gérer l'expansion des services
  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const addToCart = (service: Service) => {
    addItem({
      serviceId: service.id,
      serviceName: service.name,
      price: Number.parseFloat(service.price),
      duration: Number.parseInt(service.durationMin, 10),
    })
  }

  const removeFromCart = (serviceId: string) => {
    removeItem(serviceId)
  }

  // Vérifier si un service est dans le panier
  const isInCart = (serviceId: string) => {
    return cart.some((item) => item.serviceId === serviceId)
  }

  const calculateTotal = () => total()
  const calculateTotalDuration = () => totalDuration()

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
    router.push(`/salon/${id}/booking`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-60 w-full mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-2" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Failed to load organization</div>
  }

  if (!organization) {
    return <div>Organization not found</div>
  }

  const filteredServices = selectedDepartment
    ? organization.services.filter((service) => service.departmentId === selectedDepartment)
    : organization.services

  return (
    <div className="flex relative flex-col min-h-[100dvh] bg-gray-50">
      {/* Image de couverture avec header flottant */}
      <div className="relative h-64 md:h-80 lg:h-96 container mx-auto max-w-6xl mt-0">
        <Image
          src={`${organization.imageCover}`}
          alt={organization.name}
          fill
          className="object-cover rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Header flottant */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <Link href="/">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-white p-3 rounded-full backdrop-blur-sm">
              <Home className="h-5 w-5 text-black" />
            </motion.div>
          </Link>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="bg-white p-3 rounded-full backdrop-blur-sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: organization.name,
                    text: `Découvrez ${organization.name} - ${organization.description?.substring(0, 50)}...`,
                    url: window.location.href,
                  })
                }
              }}
            >
              <Share2 className="h-5 w-5 text-black" />
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }} className={cn("p-3 rounded-full backdrop-blur-sm bg-white")}>
              <Phone className="h-5 w-5 text-black" />
            </motion.button>
          </div>
        </div>

        {/* Informations en bas de l'image */}
        <div className="absolute bottom-4 left-4 right-4 text-white lg:left-8 lg:right-8 lg:bottom-8">
          <h1 className="text-2xl lg:text-4xl font-bold mb-1"></h1>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <div className="flex items-center text-sm lg:text-base font-medium mb-2">
            <MapPin className="h-4 w-4 mr-1 lg:h-5 lg:w-5" />
            <span>{organization.address}</span>
          </div>
          <div className="flex items-center gap-3">
            {organization.verificationStatus === "verified" ? (
              <Badge className="bg-green-500">Vérifié</Badge>
            ) : (
              <Badge className="bg-red-500">Non vérifié</Badge>
            )}

            <div className="flex items-center text-sm lg:text-base">
              {organization.OrganizationAvailability && (
                <>
                  <Clock className="h-4 w-4 mr-1 lg:h-5 lg:w-5" />
                  <span>
                    {formatTime(organization.OrganizationAvailability[0].openingTime)}-{" "}
                    {formatTime(organization.OrganizationAvailability[0].closingTime)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Boutons d'action */}
      <div className="flex mb-6 container mx-auto max-w-6xl sticky top-0 z-[999] bg-white">
        <Button
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-none border-none py-6"
          onClick={() => setShowCart(true)}
        >
          <Grid className="h-4 w-4 mr-2" />
          Services
          {cart.length > 0 && <Badge className="ml-2 bg-white text-amber-500">{cart.length}</Badge>}
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-gray-500 hover:bg-gray-50 rounded-none border-none py-6"
          onClick={() => router.push(`/salon/${id}/boutique`)}
        >
          <ShoppingBasket className="h-4 w-4 mr-2" />
          Boutique
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-gray-500 hover:bg-gray-50 rounded-none border-none py-6"
          onClick={() => router.push(`/salon/${id}/queue`)}
        >
          <ListOrdered className="h-4 w-4 mr-2" />
          Fil d'attente
        </Button>
      </div>
      <main className="flex-1 px-4 py-4 container mx-auto max-w-6xl">
        {/* Départements */}
        <div className="lg:flex lg:gap-8">
          <div className="mb-6 bg-gray-50 lg:w-1/4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-lg font-bold mb-3">Que souhaitez vous faire ?</h2>
            {organization.departments.length > 1 && (
              <div className="flex lg:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide bg-purple-50 p-3 rounded-lg">
                {organization.departments.map((dept) => (
                  <motion.div
                    key={dept.id}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-row min-w-[7rem] justify-center lg:flex-row items-center lg:items-start gap-2 p-2 rounded-full cursor-pointer shrink-0", // shrink-0 empêche la réduction
                      selectedDepartment === dept.id ? "bg-[#fe9a00] shadow-sm" : "bg-white/60",
                    )}
                    onClick={() => setSelectedDepartment(dept.id)}
                  >
                    <Image
                      src={`/${dept.icon}` || "/placeholder.svg"}
                      alt={dept.label}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                    <span className="text-sm font-medium text-center lg:text-left lg:my-auto">{dept.label}</span>
                  </motion.div>
                ))}
              </div>
            )}

          </div>

          {/* Services - improve layout for desktop */}
          <div className="mb-6 lg:w-3/4">
            <div className="mt-4 space-y-3">
              <AnimatePresence>
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md",
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
                              <span>{service.durationMin} min</span>
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
        </div>
      </main>

      {/* Modal du panier */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl lg:rounded-xl w-full max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 lg:hidden" />

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
