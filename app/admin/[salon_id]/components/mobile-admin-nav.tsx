"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, Calendar, BriefcaseBusiness, Store, Users, ListOrdered, Home, Settings } from "lucide-react"
import { useSession } from "next-auth/react"

interface MobileAdminNavProps {
  salon_id : string
}

export function MobileAdminNav({salon_id} : MobileAdminNavProps) {
  
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // Ne pas afficher la navigation dans les pages de boutique
  if (pathname.includes(`/admin/${salon_id}/boutique`)) {
    return null
  }
  // Ne pas afficher la navigation dans les pages de boutique
  if (pathname.includes(`/admin/${salon_id}/calendar`)) {
    return null
  }

  // Définir les éléments de navigation en fonction du rôle
  const navItems = [
    // Éléments pour tous les rôles (ADMIN et BARBER)
    // Éléments uniquement pour les ADMIN
    {
      name: "Dashboard",
      href: `/admin/${salon_id}`,
      icon: <Wallet className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}`,
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Calendrier",
      href: `/admin/${salon_id}/calendar`,
      icon: <Calendar className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/calendar`,
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Services",
      href: `/admin/${salon_id}/services`,
      icon: <BriefcaseBusiness className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/services`,
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Boutique",
      href: `/admin/${salon_id}/boutique`,
      icon: <Store className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/boutique`,
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Staff",
      href: `/admin/${salon_id}/users`,
      icon: <Users className="h-6 w-6"/>,
      active: pathname === `/admin/${salon_id}/users`,
      roles: ["ADMIN"],
    }
  ]

  // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole || ""))

  return (
    <nav className="fixed bottom-0 left-0 container z-50 mx-auto max-w-6xl right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 shadow-lg">
      {filteredNavItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex flex-col items-center p-2">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center ${item.active ? "text-amber-500" : "text-gray-500"}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
            {item.active && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 w-6 h-1 bg-amber-500 rounded-t-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.div>
        </Link>
      ))}
    </nav>
  )
}

