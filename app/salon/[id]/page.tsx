"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { useState, useRef, useEffect } from "react"

// Icons
import { ChevronLeft, Phone, Share2 } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart-service-store"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import type { OrganizationDetails, Service } from "@/types/organization"

// Custom components
import { ServiceCard } from "./components/service-card"
import { SectionNavigation } from "./components/section-navigation"
import { CartSidebar } from "./components/cart-sidebar"
import { MobileCart } from "./components/mobile-cart"
import { PhotoGallery } from "./components/photo-gallery"
import { OrganizationInfo } from "./components/organization-info"
import { PhotosGrid } from "./components/photos-grid"
import { TeamSection } from "./components/team-section"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function OrganizationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { items: cart, addItem, removeItem, total, clearCart } = useCartStore()
  const isMobile = useIsMobile()

  const [activeSection, setActiveSection] = useState("prestations")
  const [activeServiceCategory, setActiveServiceCategory] = useState("all")
  const prestationsRef = useRef<HTMLDivElement>(null)
  const equipeRef = useRef<HTMLDivElement>(null)
  const aproposRef = useRef<HTMLDivElement>(null)
  const photosRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const { data: organization, error, isLoading } = useSWR<OrganizationDetails>(`/api/organizations/${id}`, fetcher)

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  // Définir les sections pour la navigation
  const sections = [
    { id: "prestations", label: "Prestations", ref: prestationsRef as React.RefObject<HTMLDivElement> },
    { id: "equipe", label: "Équipe", ref: equipeRef as React.RefObject<HTMLDivElement> },
    { id: "apropos", label: "À propos", ref: aproposRef as React.RefObject<HTMLDivElement> },
    { id: "photos", label: "Photos", ref: photosRef as React.RefObject<HTMLDivElement> },
  ]

  // Effet pour détecter la section visible lors du défilement
  useEffect(() => {
    const handleScroll = () => {
      if (!prestationsRef.current || !equipeRef.current || !aproposRef.current || !photosRef.current) return

      const sectionRefs = {
        prestations: prestationsRef.current,
        equipe: equipeRef.current,
        apropos: aproposRef.current,
        photos: photosRef.current,
      }

      const offset = isMobile ? 200 : 100
      const scrollPosition = window.scrollY + offset

      // Trouver la section actuellement visible
      let currentSection = "prestations"

      // Vérifier de bas en haut pour trouver la première section visible
      if (scrollPosition >= sectionRefs.photos.offsetTop) {
        currentSection = "photos"
      } else if (scrollPosition >= sectionRefs.apropos.offsetTop) {
        currentSection = "apropos"
      } else if (scrollPosition >= sectionRefs.equipe.offsetTop) {
        currentSection = "equipe"
      } else if (scrollPosition >= sectionRefs.prestations.offsetTop) {
        currentSection = "prestations"
      }

      if (currentSection !== activeSection) {
        // Mettre à jour l'onglet actif sans déclencher de défilement automatique
        setActiveSection(currentSection)
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

  // Toggle service in cart
  const toggleServiceInCart = (service: Service) => {
    if (isInCart(service.id)) {
      removeFromCart(service.id)
    } else {
      addToCart(service)
    }
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

  // Déterminer si le salon est actuellement ouvert
  const isOpen = () => {
    if (!organization.OrganizationAvailability || organization.OrganizationAvailability.length === 0) {
      return false
    }

    const availability = organization.OrganizationAvailability[0]
    const now = new Date()
    const day = now.getDay() // 0 = dimanche, 1 = lundi, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes() // Temps actuel en minutes

    // Vérifier si le salon est ouvert aujourd'hui
    const dayMapping: Record<number, keyof typeof availability> = {
      0: "sundayOpen",
      1: "mondayOpen",
      2: "tuesdayOpen",
      3: "wednesdayOpen",
      4: "thursdayOpen",
      5: "fridayOpen",
      6: "saturdayOpen",
    }

    const isOpenToday = availability[dayMapping[day]]

    if (!isOpenToday) return false

    // Vérifier si l'heure actuelle est dans les heures d'ouverture
    return currentTime >= availability.openingTime && currentTime <= availability.closingTime
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main content */}
      <main className={cn("flex-1", isMobile ? "pt-0 pb-24" : "pt-0")}>
        {/* Hero image for mobile */}
        {isMobile && (
          <div className="relative">
            <PhotoGallery coverImage={organization.imageCover} />
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
                <a
                  href={`tel:${organization.phone}`}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="lg:flex lg:gap-8">
            {/* Main content area */}
            <div className="lg:w-3/4 relative">
              <div className="flex">
                {/* Breadcrumb navigation */}
                <div className="bg-white w-full border-b flex justify-between border-gray-100 py-2">
                  <div className="flex items-center text-sm">
                    <Link href="/" className="text-gray-500">
                      Accueil
                    </Link>
                    <span className="mx-1 text-gray-500">•</span>
                    <span className="font-medium">{organization.name}</span>
                  </div>
                  <div>
                    <span className="mx-1 text-gray-500">•</span>
                    <Link href={`/salon/${id}/boutique`} className="text-sm font-medium">
                      Notre boutique
                    </Link>
                  </div>
                </div>
              </div>

              {/* Organization name and info for desktop */}
              {!isMobile && (
                <div className="mt-3 mb-6">
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
              {!isMobile && <PhotoGallery coverImage={organization.imageCover} isDesktop />}

              {/* Organization info for mobile */}
              {isMobile && (
                <div className="py-6">
                  <h1 className="text-3xl font-bold">{organization.name}</h1>
                  <div className="mt-2 text-gray-600">{organization.address}</div>
                  <div className={`mt-1 font-medium ${isOpen() ? "text-green-600" : "text-amber-600"}`}>
                    {isOpen() ? "Ouvert" : "Fermé"}
                  </div>
                </div>
              )}

              {/* Conteneur pour la navigation avec une référence */}
              <div ref={navContainerRef} className="w-full bg-white">
                <SectionNavigation
                  activeSection={activeSection}
                  onSectionChange={scrollToSection}
                  isMobile={isMobile}
                  sections={sections}
                />
              </div>

              {/* Prestations section */}
              <div ref={prestationsRef} id="prestations" className={cn("mb-12 pt-8", isMobile && "pt-8")}>

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
                    <ServiceCard
                      key={service.id}
                      id={service.id}
                      name={service.name}
                      duration={service.durationMin}
                      price={service.price}
                      isInCart={isInCart(service.id)}
                      onToggleCart={() => toggleServiceInCart(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Team section - Remplacé par notre nouveau composant */}
              <div ref={equipeRef} id="equipe">
                <TeamSection organizationId={id as string} />
              </div>

              {/* About section */}
              <div ref={aproposRef} id="apropos" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">À propos</h2>
                <OrganizationInfo
                  description={organization.description}
                  address={organization.address}
                  availability={organization.OrganizationAvailability}
                />
              </div>

              {/* Photos section */}
              <div ref={photosRef} id="photos" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Photos</h2>
                <PhotosGrid coverImage={organization.imageCover} />
              </div>
            </div>

            {/* Sidebar for desktop */}
            {!isMobile && (
              <div className="lg:w-1/4 hidden lg:block">
                <CartSidebar
                  cart={cart}
                  total={total}
                  removeFromCart={removeFromCart}
                  proceedToBooking={proceedToBooking}
                  address={organization.address}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile cart */}
      {isMobile && <MobileCart cart={cart} removeFromCart={removeFromCart} proceedToBooking={proceedToBooking} />}
    </div>
  )
}
