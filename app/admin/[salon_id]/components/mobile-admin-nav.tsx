"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, Calendar, BriefcaseBusiness, Store, Users, Book, ChartCandlestick } from "lucide-react"
import { useSession } from "next-auth/react"

interface MobileAdminNavProps {
  salon_id: string
}

export function MobileAdminNav({ salon_id }: MobileAdminNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

 
  // Ne pas afficher la navigation dans les pages 
  if (pathname.includes(`/admin/${salon_id}/boutique`)) {
    return null
  }
  if (pathname.includes(`/admin/${salon_id}/calendar`)) {
    return null
  }
  if (pathname.includes(`/admin/${salon_id}/blogs`)) {
    return null
  }
  
  const navItems = [
    {
      name: "Dashboard",
      href: `/admin/${salon_id}`,
      icon: <Wallet className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}`,
      roles: ["ADMIN", "BARBER"],
      priority: 1
    },
    {
      name: "Calendrier",
      href: `/admin/${salon_id}/calendar`,
      icon: <Calendar className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/calendar`,
      roles: ["ADMIN", "BARBER"],
      priority: 1
    },
    {
      name: "Services",
      href: `/admin/${salon_id}/services`,
      icon: <BriefcaseBusiness className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/services`,
      roles: ["ADMIN", "BARBER"],
      priority: 1
    },
    {
      name: "Boutique",
      href: `/admin/${salon_id}/boutique`,
      icon: <Store className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/boutique`,
      roles: ["ADMIN", "BARBER"],
      priority: 2
    },
    {
      name: "Blogs",
      href: `/admin/${salon_id}/blogs`,
      icon: <Book className="h-6 w-6" />,
      active: pathname.includes(`/admin/${salon_id}/blogs`),
      roles: ["ADMIN"],
      priority: 3
    },
    {
      name: "Staff",
      href: `/admin/${salon_id}/users`,
      icon: <Users className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/users`,
      roles: ["ADMIN"],
      priority: 2
    },
    {
      name: "Gestion Financière",
      href: `/admin/${salon_id}/finance`,
      icon: <ChartCandlestick className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/finance`,
      roles: ["ADMIN"],
      priority: 3
    },
    {
      name: "Portefeuille",
      href: `/admin/${salon_id}/portefeuille`,
      icon: <Wallet className="h-6 w-6" />,
      active: pathname === `/admin/${salon_id}/wallet`,
      roles: ["ADMIN"],
      priority: 3
    }
  ]

  // Filtrer par rôle
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole || ""))

  return (
    <>
      {/* Version mobile - seulement 5 éléments */}
      <nav className="md:hidden fixed bottom-0 left-0 container z-50 mx-auto max-w-6xl right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 shadow-lg">
        {filteredNavItems
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 5)
          .map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
      </nav>

      {/* Version tablette/desktop - tous les éléments */}
      <nav className="hidden md:flex fixed bottom-0 left-0 container z-50 mx-auto max-w-6xl right-0 bg-white border-t border-gray-200 justify-around items-center py-2 px-2 shadow-lg">
        {filteredNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </>
  )
}

// Composant séparé pour un item de navigation
function NavItem({ item }: { item: any }) {
  return (
    <Link href={item.href} className="flex flex-col items-center p-2">
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
  )
}