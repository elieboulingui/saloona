"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wallet, Users, CalendarIcon } from "lucide-react"

const NavLink = () => {

  const pathname = usePathname()

  const navItems = [
    {
      name: "Transactions",
      href: "/admin",
      icon: <Wallet className="h-4 w-4 mr-2" />,
      active: pathname === "/admin",
    },
    {
      name: "File d'attente",
      href: "/admin/waiting",
      icon: <Users className="h-4 w-4 mr-2" />,
      active: pathname === "/admin/waiting",
    },
    {
      name: "Calendrier",
      href: "/admin/calendar",
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      active: pathname === "/admin/calendar",
    },
  ]
  return (
    <div className="border-b bg-white sticky top-0">
      <nav className="flex overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${item.active
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
              }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default NavLink;