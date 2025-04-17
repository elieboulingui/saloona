"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, ShoppingBag, Plus, Minus, X, ShoppingCart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

// Données de démonstration
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Huile nourrissante",
    description: "Huile naturelle pour nourrir et hydrater vos dreads locks.",
    price: 5000,
    image: "/placeholder.svg?height=200&width=200&text=Huile",
    category: "Soins",
    stock: 15,
  },
  {
    id: "p2",
    name: "Shampoing spécial dreads",
    description: "Shampoing doux spécialement formulé pour nettoyer les dreads sans les abîmer.",
    price: 7500,
    image: "/placeholder.svg?height=200&width=200&text=Shampoing",
    category: "Soins",
    stock: 10,
  },
  {
    id: "p3",
    name: "Cire de maintien",
    description: "Cire naturelle pour maintenir vos dreads en place et leur donner une belle finition.",
    price: 4500,
    image: "/placeholder.svg?height=200&width=200&text=Cire",
    category: "Styling",
    stock: 20,
  },
  {
    id: "p4",
    name: "Bijoux pour dreads",
    description: "Ensemble de bijoux décoratifs pour personnaliser vos dreads locks.",
    price: 3000,
    image: "/placeholder.svg?height=200&width=200&text=Bijoux",
    category: "Accessoires",
    stock: 30,
  },
  {
    id: "p5",
    name: "Bonnet en satin",
    description: "Bonnet en satin pour protéger vos dreads pendant la nuit.",
    price: 6000,
    image: "/placeholder.svg?height=200&width=200&text=Bonnet",
    category: "Accessoires",
    stock: 8,
  },
  {
    id: "p6",
    name: "Spray hydratant",
    description: "Spray hydratant pour rafraîchir vos dreads au quotidien.",
    price: 4000,
    image: "/placeholder.svg?height=200&width=200&text=Spray",
    category: "Soins",
    stock: 12,
  },
]

// Catégories uniques
const CATEGORIES = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)))

export default function BoutiquePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true

    return matchesSearch && matchesCategory
  })

  // Ajouter au panier
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ])
    }
  }

  // Retirer du panier
  const removeFromCart = (productId: string) => {
    const existingItem = cart.find((item) => item.productId === productId)

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)))
    } else {
      setCart(cart.filter((item) => item.productId !== productId))
    }
  }

  // Supprimer du panier
  const deleteFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  // Obtenir la quantité dans le panier
  const getCartQuantity = (productId: string) => {
    const item = cart.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  // Calculer le total du panier
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Afficher les détails du produit
  const showProductDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  // Procéder au paiement
  const proceedToCheckout = () => {
    // Stocker le panier dans le localStorage ou un état global
    localStorage.setItem("shoppingCart", JSON.stringify(cart))
    router.push(`/salons/${params.id}/boutique/checkout`)
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Link href={`/salon/${params.id}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-black font-bold text-xl">Boutique</h1>
            <p className="text-black/80 text-xs">Bienvenue au store de : Sadji Dread lock</p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-full"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {cart.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </Badge>
            )}
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-4">
        {/* Barre de recherche */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-4 overflow-x-auto flex gap-2 pb-2">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer whitespace-nowrap",
              selectedCategory === null ? "bg-amber-100 text-amber-800" : "",
            )}
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Badge>
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                "cursor-pointer whitespace-nowrap",
                selectedCategory === category ? "bg-amber-100 text-amber-800" : "",
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Liste des produits */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 text-center mb-4">
              Nous n'avons pas trouvé de produits correspondant à votre recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory(null)
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col py-0">
                    <div className="relative h-40 cursor-pointer" onClick={() => showProductDetails(product)}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        {product.price.toLocaleString()} FCFA
                      </Badge>
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm mb-1 cursor-pointer" onClick={() => showProductDetails(product)}>
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-1">{product.description}</p>

                      {getCartQuantity(product.id) > 0 ? (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{getCartQuantity(product.id)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => addToCart(product)}
                            disabled={getCartQuantity(product.id) >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-amber-500 hover:bg-amber-600 mt-auto"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal du panier */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl w-full max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Votre panier</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowCart(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Votre panier est vide</p>
                  <Button variant="outline" className="mx-auto" onClick={() => setShowCart(false)}>
                    Parcourir les produits
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-amber-600 font-bold text-sm">{item.price.toLocaleString()} FCFA</p>

                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-1 text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => {
                                  const product = products.find((p) => p.id === item.productId)
                                  if (product) addToCart(product)
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => deleteFromCart(item.productId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-bold">{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraison:</span>
                      <span>2000 FCFA</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-amber-600">
                        {(calculateTotal() + 2000).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-amber-500 hover:bg-amber-600 mt-6" onClick={proceedToCheckout}>
                    Passer la commande
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détail du produit */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <>
              <div className="relative h-48 w-full rounded-md overflow-hidden mb-4">
                <Image
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <Badge>{selectedProduct.category}</Badge>
                    <span className="font-bold text-amber-600">{selectedProduct.price.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <p className="text-gray-700">{selectedProduct.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stock disponible:</span>
                  <Badge variant="outline" className="font-medium">
                    {selectedProduct.stock} unités
                  </Badge>
                </div>

                {getCartQuantity(selectedProduct.id) > 0 ? (
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => removeFromCart(selectedProduct.id)}>
                      <Minus className="h-4 w-4 mr-2" />
                      Retirer
                    </Button>
                    <span className="font-medium">{getCartQuantity(selectedProduct.id)}</span>
                    <Button
                      variant="outline"
                      onClick={() => addToCart(selectedProduct)}
                      disabled={getCartQuantity(selectedProduct.id) >= selectedProduct.stock}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => addToCart(selectedProduct)}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowProductDetail(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bouton de panier flottant */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 rounded-full" onClick={() => setShowCart(true)}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {cart.reduce((total, item) => total + item.quantity, 0)} article
            {cart.reduce((total, item) => total + item.quantity, 0) > 1 ? "s" : ""} •{" "}
            {calculateTotal().toLocaleString()} FCFA
            <ChevronRight className="ml-auto h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
