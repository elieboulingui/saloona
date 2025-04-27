"use client"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { useState, useEffect, useRef } from "react"

// Icons
import { ChevronLeft, Clock, Heart, MapPin, Share2, ShoppingCart } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { cn, formatTime } from "@/lib/utils"
import { useCartStore } from "@/store/cart-service-store"
// Remplacer la fonction useIsMobile par useMobile pour correspondre à l'import
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

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
  const router = useRouter()
  const { items: cart, addItem, removeItem, total, clearCart } = useCartStore()
  const isMobile = useIsMobile()

  const [activeSection, setActiveSection] = useState("prestations")
  const [activeServiceCategory, setActiveServiceCategory] = useState("all")
  const [isNavSticky, setIsNavSticky] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const prestationsRef = useRef<HTMLDivElement>(null)
  const equipeRef = useRef<HTMLDivElement>(null)
  const aproposRef = useRef<HTMLDivElement>(null)
  const avisRef = useRef<HTMLDivElement>(null)
  const photosRef = useRef<HTMLDivElement>(null)

  const { data: organization, error, isLoading } = useSWR<OrganizationDetails>(`/api/organizations/${id}`, fetcher)

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle scroll for active section detection
  useEffect(() => {
    let ticking = false
    let lastKnownScrollPosition = 0

    const handleScroll = () => {
      lastKnownScrollPosition = window.scrollY

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Ajouter un offset pour la navigation fixe en mobile
          const offset = isMobile ? 150 : 100
          const scrollPosition = lastKnownScrollPosition + offset

          // Définir les sections et leurs positions
          const sections = [
            { id: "prestations", ref: prestationsRef },
            { id: "equipe", ref: equipeRef },
            { id: "apropos", ref: aproposRef },
            { id: "avis", ref: avisRef },
            { id: "photos", ref: photosRef },
          ]

          // Trouver la section active
          let newActiveSection = activeSection

          // Parcourir les sections de bas en haut pour trouver la première visible
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i]
            if (section.ref.current && scrollPosition >= section.ref.current.offsetTop) {
              newActiveSection = section.id
              break
            }
          }

          // Mettre à jour seulement si la section a changé
          if (newActiveSection !== activeSection) {
            setActiveSection(newActiveSection)
          }

          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection, isMobile])

  // Scroll to section when clicking on navigation
  const scrollToSection = (sectionId: string) => {
    // Mettre à jour l'état immédiatement pour éviter le clignotement
    setActiveSection(sectionId)

    const sectionRefs = {
      prestations: prestationsRef,
      equipe: equipeRef,
      apropos: aproposRef,
      avis: avisRef,
      photos: photosRef,
    }

    const sectionRef = sectionRefs[sectionId as keyof typeof sectionRefs]

    if (sectionRef.current) {
      // Calculer l'offset en fonction de la hauteur de la navigation fixe
      const yOffset = isMobile ? -150 : -70
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset

      // Utiliser scrollTo avec behavior smooth pour une animation fluide
      window.scrollTo({
        top: y,
        behavior: "smooth",
      })
    }
  }

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  // Add service to cart
  const addToCart = (service: Service) => {
    addItem({
      serviceId: service.id,
      serviceName: service.name,
      price: Number.parseFloat(service.price),
      duration: Number.parseInt(service.durationMin, 10),
    })
  }

  // Remove service from cart
  const removeFromCart = (serviceId: string) => {
    removeItem(serviceId)
  }

  // Check if service is in cart
  const isInCart = (serviceId: string) => {
    return cart.some((item) => item.serviceId === serviceId)
  }

  // Proceed to booking
  const proceedToBooking = () => {
    router.push(`/salon/${id}/booking`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-60 w-full rounded-lg" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-red-600 text-xl font-semibold">Erreur de chargement</h2>
          <p className="text-red-500 mt-2">Impossible de charger les informations du salon.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-amber-50 p-6 rounded-lg">
          <h2 className="text-amber-600 text-xl font-semibold">Salon introuvable</h2>
          <p className="text-amber-500 mt-2">Ce salon n'existe pas ou a été supprimé.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const filteredServices = selectedDepartment
    ? organization.services.filter((service) => service.departmentId === selectedDepartment)
    : organization.services

  // Mock data for team members (to be replaced with real data)
  const teamMembers = [
    { id: "1", name: "Evard", role: "Coiffeur", image: "/placeholder.svg?height=100&width=100" },
    { id: "2", name: "Adèle", role: "Coiffeuse", image: "/placeholder.svg?height=100&width=100" },
    { id: "3", name: "Hugo", role: "Barbier", image: "/placeholder.svg?height=100&width=100" },
    { id: "4", name: "Coach Sportif", role: "Fitness", image: "/placeholder.svg?height=100&width=100" },
  ]

  // Mock data for reviews (to be replaced with real data)
  const reviews = [
    { id: "1", author: "Cédric F.", rating: 5, comment: "Très bon service, je recommande !", date: "2 mars 2023" },
    {
      id: "2",
      author: "Arnaud W.",
      rating: 5,
      comment: "Très professionnel, installations claires et sympathique unique.",
      date: "15 avril 2023",
    },
    {
      id: "3",
      author: "Aline K.",
      rating: 4,
      comment: "Accueil très chaleureux, service impeccable.",
      date: "8 mai 2023",
    },
    { id: "4", author: "Hélène A.", rating: 5, comment: "Je recommande vivement !", date: "20 juin 2023" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Mobile Header */}
      {isMobile && (
        <>
          {/* Breadcrumb navigation */}
          <div className="bg-white border-b border-gray-100 py-2 px-4">
            <div className="flex items-center text-sm">
              <Link href="/" className="text-gray-500">
                Accueil
              </Link>
             
              <span className="mx-1 text-gray-500">•</span>
              <span className="font-medium">{organization.name}</span>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className={cn("flex-1", isMobile ? "pt-0 pb-24" : "pt-0")}>
        {/* Hero image for mobile */}
        {isMobile && (
          <div className="relative h-[300px] w-full">
            <Image
              src={organization.imageCover || "/placeholder.svg?height=400&width=600"}
              alt={organization.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={() => router.push("/")}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">1/6</div>
          </div>
        )}

        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="lg:flex lg:gap-8">
            {/* Main content area */}
            <div className="lg:w-3/4 relative">
              {/* Organization name and info for desktop */}
              {!isMobile && (
                <div className="mt-8 mb-6">
                  <h1 className="text-4xl font-bold">{organization.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <div className="flex items-center">
                      <span>{organization.address}</span>
                      <a href="#" className="text-blue-600 ml-1">
                        Afficher l'itinéraire
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Image gallery for desktop */}
              {!isMobile && (
                <div className="mb-12">
                  <div className="grid grid-cols-12 gap-2 h-[400px]">
                    <div className="col-span-8 relative rounded-lg overflow-hidden">
                      <Image
                        src={organization.imageCover || "/placeholder.svg?height=400&width=600"}
                        alt={organization.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="col-span-4 grid grid-rows-2 gap-2">
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=200&width=200"
                          alt="Salon interior"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=200&width=200"
                          alt="Salon interior"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-end justify-end p-3">
                          <button className="bg-white text-black text-sm font-medium py-2 px-3 rounded-lg">
                            Afficher toutes les images
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Organization info for mobile */}
              {isMobile && (
                <div className="py-6">
                  <h1 className="text-3xl font-bold">{organization.name}</h1>                 
                  <div className="mt-2 text-gray-600">Avenue Jean Paul II, Libreville</div>
                  <div className="mt-1 text-amber-600 font-medium">Fermé</div>
                </div>
              )}

              {/* Navigation for sections */}
              <div
                ref={navRef}
                className={cn(
                  "bg-white border-b border-gray-200 transition-all duration-300",
                  isMobile ? "sticky top-0 left-0 right-0 z-40 pr-4" : "mb-4",
                )}
              >
                <div className="flex overflow-x-auto scrollbar-hide relative">
                  <button
                    onClick={() => scrollToSection("prestations")}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap font-medium text-base relative transition-colors duration-300",
                      activeSection === "prestations" ? "text-black" : "text-gray-500",
                    )}
                  >
                    Prestations
                    {activeSection === "prestations" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
                    )}
                  </button>
                  <button
                    onClick={() => scrollToSection("equipe")}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap font-medium text-base relative transition-colors duration-300",
                      activeSection === "equipe" ? "text-black" : "text-gray-500",
                    )}
                  >
                    Équipe
                    {activeSection === "equipe" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
                    )}
                  </button>
                  <button
                    onClick={() => scrollToSection("apropos")}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap font-medium text-base relative transition-colors duration-300",
                      activeSection === "apropos" ? "text-black" : "text-gray-500",
                    )}
                  >
                    À propos
                    {activeSection === "apropos" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
                    )}
                  </button>
                  <button
                    onClick={() => scrollToSection("avis")}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap font-medium text-base relative transition-colors duration-300",
                      activeSection === "avis" ? "text-black" : "text-gray-500",
                    )}
                  >
                    Avis
                    {activeSection === "avis" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
                    )}
                  </button>
                  <button
                    onClick={() => scrollToSection("photos")}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap font-medium text-base relative transition-colors duration-300",
                      activeSection === "photos" ? "text-black" : "text-gray-500",
                    )}
                  >
                    Photos
                    {activeSection === "photos" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Prestations section */}
              <div ref={prestationsRef} id="prestations" className={cn("mb-12", isMobile && "pt-8")}>
                <h2 className="text-3xl font-bold mb-6">Prestations</h2>

                {/* Service category tabs */}
                <div className="overflow-x-auto whitespace-nowrap mb-4 scrollbar-hide">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "rounded-full text-sm font-medium py-2 px-4 border-gray-300",
                        activeServiceCategory === "all" && "bg-black text-white hover:bg-black border-black",
                      )}
                      onClick={() => {
                        setActiveServiceCategory("all")
                        setSelectedDepartment(null)
                      }}
                    >
                      À la une
                    </Button>

                    {organization.departments.map((dept) => (
                      <Button
                        key={dept.id}
                        variant="outline"
                        className={cn(
                          "rounded-full text-sm font-medium py-2 px-4 border-gray-300",
                          selectedDepartment === dept.id && "bg-black text-white hover:bg-black border-black",
                        )}
                        onClick={() => {
                          setActiveServiceCategory(dept.id)
                          setSelectedDepartment(dept.id)
                        }}
                      >
                        {dept.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-0">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="border-t border-gray-100 py-6 first:border-t-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-base">{service.name}</h3>
                          <div className="text-sm text-gray-500 mt-1">{service.durationMin} min</div>
                          <div className="text-sm text-gray-500 mt-1">
                            à partir de {Number.parseInt(service.price).toLocaleString()} FCFA
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-full border-gray-300 px-5"
                          onClick={() => {
                            if (isInCart(service.id)) {
                              removeFromCart(service.id)
                            } else {
                              addToCart(service)
                            }
                          }}
                        >
                          {isInCart(service.id) ? "Sélectionné" : "Réserver"}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-gray-500">88 prestations disponibles</span>
                    <Button variant="outline" className="rounded-full border-gray-300 px-5">
                      Tout voir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Team section */}
              <div ref={equipeRef} id="equipe" className="mb-12">
                <h2 className="text-3xl font-bold mb-8">Équipe</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="text-center">
                      <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-gray-100">
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* About section */}
              <div ref={aproposRef} id="apropos" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">À propos</h2>

                {organization.description && (
                  <div className="mb-8">
                    <p className="text-gray-600">{organization.description}</p>
                  </div>
                )}

                <div className="space-y-8">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      Adresse
                    </h3>
                    <p className="text-gray-600 mb-2">{organization.address}</p>
                    <div className="h-60 bg-gray-200 rounded-lg">
                      {/* Map placeholder - to be replaced with actual map */}
                      <div className="h-full w-full flex items-center justify-center text-gray-400">Carte</div>
                    </div>
                  </div>

                  {organization.OrganizationAvailability && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        Horaires d'ouverture
                      </h3>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="flex justify-between pr-4">
                          <span>Lundi</span>
                          <span>
                            {organization.OrganizationAvailability[0].mondayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Mardi</span>
                          <span>
                            {organization.OrganizationAvailability[0].tuesdayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Mercredi</span>
                          <span>
                            {organization.OrganizationAvailability[0].wednesdayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Jeudi</span>
                          <span>
                            {organization.OrganizationAvailability[0].thursdayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Vendredi</span>
                          <span>
                            {organization.OrganizationAvailability[0].fridayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Samedi</span>
                          <span>
                            {organization.OrganizationAvailability[0].saturdayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                        <div className="flex justify-between pr-4">
                          <span>Dimanche</span>
                          <span>
                            {organization.OrganizationAvailability[0].sundayOpen
                              ? `${formatTime(organization.OrganizationAvailability[0].openingTime)} - ${formatTime(
                                  organization.OrganizationAvailability[0].closingTime,
                                )}`
                              : "Fermé"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews section */}
              <div ref={avisRef} id="avis" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Avis</h2>
                <div className="flex items-center mb-6">
                  <div className="flex items-center mr-4">
                    <span className="text-3xl font-bold mr-2">4.8</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-black fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-500">(128 avis)</span>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{review.author}</h3>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < review.rating ? "text-black fill-current" : "text-gray-300 fill-current",
                              )}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="rounded-full border-gray-300 px-5 mt-6">
                  Voir tous les avis
                </Button>
              </div>

              {/* Photos section */}
              <div ref={photosRef} id="photos" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={i === 0 ? organization.imageCover || "/placeholder.svg" : "/placeholder.svg"}
                        alt={`Photo ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar for desktop */}
            {!isMobile && (
              <div className="lg:w-1/4 hidden lg:block">
                <div className="sticky top-6 border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Aucun service sélectionné</p>
                        <p className="text-gray-400 text-sm mt-1">Sélectionnez des services pour réserver</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-60 overflow-auto">
                          {cart.map((item) => (
                            <div key={item.serviceId} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.serviceName}</p>
                                <p className="text-sm text-gray-500">{item.duration} min</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{item.price.toLocaleString()} FCFA</p>
                                <button className="text-red-500 text-sm" onClick={() => removeFromCart(item.serviceId)}>
                                  Retirer
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{total().toLocaleString()} FCFA</span>
                        </div>

                        <Button
                          className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={proceedToBooking}
                        >
                          Continuer la réservation
                        </Button>
                      </>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        <div>
                          <span className="font-medium flex items-center">
                            Fermé
                            <svg
                              className="w-4 h-4 ml-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start">
                        <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Avenue Jean Paul II, Libreville, Estuaire</p>
                          <a href="#" className="text-blue-600 text-sm">
                            Afficher l'itinéraire
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed booking button for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
          <Button
            className={cn(
              "w-full text-white rounded-lg py-6 text-base font-medium relative",
              cart.length > 0 ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-300 cursor-not-allowed",
            )}
            onClick={proceedToBooking}
            disabled={cart.length === 0}
          >
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
            Réserver
          </Button>
        </div>
      )}
    </div>
  )
}
