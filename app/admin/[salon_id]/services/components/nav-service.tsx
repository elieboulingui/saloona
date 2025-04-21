"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Package, ShoppingCart, Tag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface NavServiceProps {
  salonId: string   
}

const NavService = ({salonId}:NavServiceProps) => {

    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)
  
    // Déterminer l'onglet actif
    const isServiceActive = pathname === `/admin/${salonId}/services`
    const isDepartmentActive = pathname === `/admin/${salonId}/services/departments`
    const isAvabilityActive = pathname === `/admin/${salonId}/services/avability`
  
    useEffect(() => {
      setIsMounted(true)
    }, [])
  
    if (!isMounted) {
      return null
    }

    return ( 

    <>
          {/* Header */}
    <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href={`/admin/${salonId}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Services</h1>
            <p className="text-white/80 text-xs">Gérez vos services et disponibilité en toute simplicité</p>
          </div>
        </div>
       
      </header>
      <div className="bg-white border-b">
      <nav className="flex overflow-x-auto">
        <Link
          href={`/admin/${salonId}/services`}
          className={`flex items-center px-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
            isServiceActive
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
          }`}
        >
           <Package className="h-4 w-4 mr-2" />

          Services
        </Link>
        <Link
          href={`/admin/${salonId}/services/departments`}
          className={`flex items-center px-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
            isDepartmentActive
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
          }`}
        >
         <Package className="h-4 w-4 mr-2" />

          Départements
        </Link>
        <Link
          href={`/admin/${salonId}/services/avability`}
          className={`flex items-center px-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
            isAvabilityActive
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
          }`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Disponibilités
        </Link>
      </nav>
    </div>
    </>

     );
}
 
export default NavService;