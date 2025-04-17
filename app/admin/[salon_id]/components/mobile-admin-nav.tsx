"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, Calendar, BriefcaseBusiness, Store, Users, ListOrdered, Home, Settings } from "lucide-react"
import { useSession } from "next-auth/react"

export function MobileAdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // Ne pas afficher la navigation dans les pages de boutique
  if (pathname.includes("/admin/boutique")) {
    return null
  }

  // Définir les éléments de navigation en fonction du rôle
  const navItems = [
    // Éléments pour tous les rôles (ADMIN et BARBER)
    // Éléments uniquement pour les ADMIN
    {
      name: "Dashboard",
      href: "/admin",
      icon: <Wallet className="h-6 w-6" />,
      active: pathname === "/admin",
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Calendrier",
      href: "/admin/calendar",
      icon: <Calendar className="h-6 w-6" />,
      active: pathname === "/admin/calendar",
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Services",
      href: "/admin/services",
      icon: <BriefcaseBusiness className="h-6 w-6" />,
      active: pathname === "/admin/services",
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Boutique",
      href: "/admin/boutique",
      icon: <Store className="h-6 w-6" />,
      active: pathname === "/admin/boutique",
      roles: ["ADMIN", "BARBER"],
    },
    {
      name: "Parametres",
      href: "/admin/settings",
      icon: <Settings className="h-6 w-6" />,
      active: pathname === "/admin/settings",
      roles: ["ADMIN", "BARBER"],
    }
  ]

  // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole || ""))

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4 shadow-lg z-10">
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

