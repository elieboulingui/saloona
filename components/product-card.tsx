"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description?: string
    price: number
    stock: number
    image?: string
  }
  onClick: () => void
  onAddToCart: () => void
}

export function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden cursor-pointer h-full flex flex-col" onClick={onClick}>
        <div className="relative h-40 w-full">
          {product.image ? (
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 hover:bg-amber-600">{product.price.toLocaleString()} FCFA</Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/80">
              Stock: {product.stock}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          <h3 className="font-bold mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart()
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

