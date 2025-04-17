"use client"
import Link from "next/link"
import { BriefcaseBusiness, Clock, Home, ShoppingBag, User } from "lucide-react"
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion"


const BottomNavigation = () => {

  const { data: session } = useSession()

  const pathname = usePathname()

  if (pathname.includes("/admin")) {
    return null
  }

  if (pathname.includes("/boutique")) {
    return null
  }

  if (pathname.includes("/booking")) {
    return null
  }

  if (pathname.includes("/pos")) {
    return null
  }

  const navItems = [
    {
      name: "Accueil",
      href: "/",
      icon: <Home className="h-6 w-6" />,
      active: pathname === "/",
    },
    {
      name: "Services",
      href: "/services",
      icon: <BriefcaseBusiness className="h-6 w-6" />,
      active: pathname === "/services",
    },
    {
      name: "Boutique",
      href: "/boutique",
      icon: <ShoppingBag className="h-6 w-6" />,
      active: pathname === "/boutique",
    },
    {
      name: "Fil d'attente",
      href: "/tv",
      icon: <Clock className="h-6 w-6" />,
      active: pathname === "/tv",
    },
    {
      name: "Compte",
      href: session?.user ? "/admin" : "/connexion",
      icon: <User className="h-6 w-6" />,
      active: pathname === "/connexion",
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4 shadow-lg z-10">
      {navItems.map((item) => (
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
  );
}

export default BottomNavigation;