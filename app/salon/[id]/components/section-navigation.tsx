"use client"

import type React from "react"

import { useEffect } from "react"
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
  // Handle scroll for active section detection
  useEffect(() => {
    const handleScroll = () => {
      // Ajouter un offset pour la navigation fixe
      const offset = isMobile ? 150 : 100
      const scrollPosition = window.scrollY + offset

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
        onSectionChange(newActiveSection)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection, isMobile, onSectionChange, sections])

  return (
    <div
      className={cn(
        "bg-white border-b border-gray-200 transition-all duration-300 sticky z-40",
        isMobile ? "top-0 left-0 right-0 pr-4" : "top-0 mb-4",
      )}
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
