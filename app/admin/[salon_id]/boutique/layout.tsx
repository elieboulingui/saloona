"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Package, Tag, ShoppingCart } from "lucide-react"

export default function BoutiqueLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Déterminer l'onglet actif
  const isProductsActive = pathname === "/admin/boutique"
  const isCategoriesActive = pathname === "/admin/boutique/category"
  const isOrdersActive = pathname === "/admin/boutique/orders"

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Boutique</h1>
            <p className="text-white/80 text-xs">Gérez votre boutique en toute simplicité</p>
          </div>
        </div>
        {isProductsActive && (
          <Link href="/admin/boutique/category">
            <motion.button whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white">
              <Tag className="h-5 w-5" />
            </motion.button>
          </Link>
        )}
        {isCategoriesActive && (
          <Link href="/admin/boutique">
            <motion.button whileTap={{ scale: 0.9 }} className="bg-white/20 p-2 rounded-full text-white">
              <Package className="h-5 w-5" />
            </motion.button>
          </Link>
        )}
      </header>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <nav className="flex overflow-x-auto">
          <Link
            href="/admin/boutique"
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
              isProductsActive
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
            }`}
          >
            <Package className="h-4 w-4 mr-2" />
            Produits
          </Link>
          <Link
            href="/admin/boutique/category"
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
              isCategoriesActive
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
            }`}
          >
            <Tag className="h-4 w-4 mr-2" />
            Catégories
          </Link>
          <Link
            href="/admin/boutique/orders"
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
              isOrdersActive
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-200"
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Commandes
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Désactiver le MobileAdminNav pour les pages de boutique */}
      <style jsx global>{`
        .admin-boutique-nav {
          display: none;
        }
      `}</style>
    </div>
  )
}

