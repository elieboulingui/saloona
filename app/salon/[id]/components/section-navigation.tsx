"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SectionNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isMobile: boolean
  sections: {
    id: string
    label: string
    ref: React.RefObject<HTMLDivElement>
  }[]
}

export function SectionNavigation({ activeSection, onSectionChange, isMobile, sections }: SectionNavigationProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [navWidth, setNavWidth] = useState<number | null>(null)
  const [navTop, setNavTop] = useState<number | null>(null)

  // Initialiser la position et la largeur de la navigation
  useEffect(() => {
    if (navRef.current) {
      // Stocker la position initiale du nav
      const rect = navRef.current.getBoundingClientRect()
      setNavTop(rect.top + window.scrollY)
      setNavWidth(rect.width)
    }
  }, [])

  // Gérer le scroll pour la détection de la position sticky
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current && navTop !== null) {
        // La navigation devient sticky uniquement lorsque le scroll dépasse sa position initiale
        const shouldBeSticky = window.scrollY > navTop
        setIsSticky(shouldBeSticky)

        // Mettre à jour la largeur si nécessaire
        if (shouldBeSticky && navRef.current) {
          const parentWidth = navRef.current.parentElement?.clientWidth || navRef.current.clientWidth
          setNavWidth(parentWidth)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Appeler handleScroll immédiatement pour initialiser l'état
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [navTop])

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (navRef.current) {
        if (!isSticky) {
          // Si non sticky, mettre à jour la largeur et la position
          const rect = navRef.current.getBoundingClientRect()
          setNavWidth(rect.width)
          setNavTop(rect.top + window.scrollY)
        } else {
          // Si sticky, mettre à jour uniquement la largeur
          const parentWidth = navRef.current.parentElement?.clientWidth || navRef.current.clientWidth
          setNavWidth(parentWidth)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isSticky])

  return (
    <div
      ref={navRef}
      className={cn("bg-white border-b border-gray-200 transition-all duration-300 z-40", isSticky ? "fixed" : "")}
      style={{
        top: isSticky ? 0 : "auto",
        width: isSticky ? (navWidth ? `${isMobile ? "100%" : navWidth}px` : "100%") : "100%",
        left: isSticky ? (isMobile ? 0 : "auto") : "auto",
        right: isSticky ? (isMobile ? 0 : "auto") : "auto",
      }}
    >
      <div className="flex overflow-x-auto scrollbar-hide relative">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "px-4 py-3 whitespace-nowrap font-medium text-sm lg:text-base relative transition-colors duration-300",
              activeSection === section.id ? "text-black" : "text-gray-500",
            )}
          >
            {section.label}
            {activeSection === section.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-all duration-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
