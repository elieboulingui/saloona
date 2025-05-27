"use client"

import { useState } from "react"
import { User, LogOut, Settings, ListOrdered, Wallet, Calendar, BriefcaseBusiness, Store, Book, Users, House, ChartCandlestick } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import Link from "next/link"

interface UserSheetProps {
  salonId: string
}

export function UserSheet_2({ salonId }: UserSheetProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) return null

  const userInitials = session.user.name
    ? session.user.name
      .split(" ")
      .map((n: any[]) => n[0])
      .join("")
      .toUpperCase()
    : "U"

  const menuItems = [
    {
      icon: ListOrdered,
      label: "Fil d'attente",
      href: `/admin/${salonId}/waiting`,
    },
    {
      icon: Settings,
      label: "Notifications",
      href: `/admin/${salonId}/notifications`,
    },
    {
      icon: User,
      label: "Mon compte",
      href: `/admin/${salonId}/profil`,
    },
    {
      icon: Settings,
      label: "Paramètres",
      href: `/admin/${salonId}/settings`,
    },
  ]


  const navItems = [
    {
      name: "Dashboard",
      href: `/admin/${salonId}`,
      icon: Wallet,
    },
    {
      name: "Calendrier",
      href: `/admin/${salonId}/calendar`,
      icon: Calendar,

    },
    {
      name: "Services",
      href: `/admin/${salonId}/services`,
      icon: BriefcaseBusiness,

    },
    {
      name: "Boutique",
      href: `/admin/${salonId}/boutique`,
      icon: Store,

    },
    {
      name: "Blogs",
      href: `/admin/${salonId}/blogs`,
      icon: Book,

    },
    {
      name: "Staff",
      href: `/admin/${salonId}/users`,
      icon: Users,

    },
    {
      name: "Gestion Financiere",
      href: `/admin/${salonId}/finance`,
      icon: ChartCandlestick,
    },
    {
      name: "Portefeuille",
      href: `/admin/${salonId}/portefeuille`,
      icon: Wallet,
    }
  ]


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/20">
          <Avatar className="h-8 w-8 border-2 border-white/20">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || "Utilisateur"} />
            <AvatarFallback className="bg-amber-100 text-amber-800">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader className="pb-6">
          <SheetTitle>Mon profil</SheetTitle>
          <SheetDescription>Gérez votre compte et vos paramètres</SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 ml-2 items-center py-6 border-y">
          <Avatar className="h-10 w-10 ">
            <AvatarImage className="" src={session.user.image || ""} alt={session.user.name || "Utilisateur"} />
            <AvatarFallback className="bg-amber-100 text-amber-800 text-sm">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-lg">{session.user.name}</h3>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>


        <div className="py-2 ">
          {navItems.map((items) => (
            <Link
              key={items.name}
              href={items.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <items.icon className="h-5 w-5 text-amber-500" />
              <span>{items.name}</span>
            </Link>
          ))}
        </div>


        <div className="">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <item.icon className="h-5 w-5 text-amber-500" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <SheetFooter>
          <Button variant="destructive" className="w-full mt-4" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
