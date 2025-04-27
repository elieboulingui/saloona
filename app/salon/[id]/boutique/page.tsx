"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, ShoppingBag, Plus, Minus, X, ShoppingCart, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useProductCartStore } from "@/store/cart-store"
import type { Product, Category } from "@/types/product"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BoutiquePage() {

  const { id } = useParams();

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // Utiliser le store Zustand pour le panier
  const {
    items: cart,
    addItem,
    updateQuantity,
    removeItem,
    isInCart,
    getQuantity,
    total,
    totalItems,
    clearCart,
  } = useProductCartStore()

  // Récupérer les produits et catégories depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Dans une application réelle, remplacez ces URLs par vos endpoints API
        const productsResponse = await fetch(`/api/organizations/${id}/products`)

        if (!productsResponse.ok) throw new Error("Erreur lors du chargement des produits")

        const responses = await productsResponse.json()

        setProducts(responses.products)
        setCategories(responses.categories)
      } catch (err) {
        console.error("Erreur de chargement:", err)
        setError("Impossible de charger les produits. Veuillez réessayer plus tard.")

      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Filtrer les produits
  const filteredProducts = products.length > 0 &&  products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true

    return matchesSearch && matchesCategory
  }) || []

  // Ajouter au panier
  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || "/placeholder.svg",
    })
  }

  // Afficher les détails du produit
  const showProductDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  // Procéder au paiement
  const proceedToCheckout = () => {
    router.push(`/salon/${id}/boutique/checkout`)
  }

  return (
    <div className="flex flex-col container max-w-6xl mx-auto min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Link href={`/salon/${id}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-black font-bold text-xl">Boutique</h1>
            <p className="text-black/80 text-xs">Découvrez nos produits de qualité</p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-full"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white">
                {totalItems()}
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
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className={cn(
                "cursor-pointer whitespace-nowrap",
                selectedCategory === category.id ? "bg-amber-100 text-amber-800" : "",
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold mb-2">Erreur de chargement</h3>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <Badge className="absolute top-2 right-2 bg-blue-500">
                        {product.price.toLocaleString()} FCFA
                      </Badge>
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm mb-1 cursor-pointer" onClick={() => showProductDetails(product)}>
                        {product.name}
                      </h3>

                      {getQuantity(product.id) > 0 ? (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{getQuantity(product.id)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                            disabled={getQuantity(product.id) >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-amber-500 text-sm lg:text-lg rounded-full hover:bg-amber-600 mt-auto"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingBag className="h-4 w-4" />
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
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-1 text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => removeItem(item.productId)}
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
                      <span className="font-bold">{total().toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraison:</span>
                      <span>2000 FCFA</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-amber-600">{(total() + 2000).toLocaleString()} FCFA</span>
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
                    <Badge>{selectedProduct.category.name}</Badge>
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

                {getQuantity(selectedProduct.id) > 0 ? (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => updateQuantity(selectedProduct.id, getQuantity(selectedProduct.id) - 1)}
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Retirer
                    </Button>
                    <span className="font-medium">{getQuantity(selectedProduct.id)}</span>
                    <Button
                      variant="outline"
                      onClick={() => updateQuantity(selectedProduct.id, getQuantity(selectedProduct.id) + 1)}
                      disabled={getQuantity(selectedProduct.id) >= selectedProduct.stock}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
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
            {totalItems()} article{totalItems() > 1 ? "s" : ""} • {total().toLocaleString()} FCFA
            <ChevronRight className="ml-auto h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
