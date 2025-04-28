"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/types/cart"
import { AnimatePresence, motion } from "framer-motion"
import { Clock, ShoppingBag, Trash2 } from "lucide-react"
import { useState } from "react"

interface MobileCartProps {
  cart: CartItem[]
  removeFromCart: (serviceId: string) => void
  proceedToBooking: () => void
}

export function MobileCart({ cart, removeFromCart, proceedToBooking }: MobileCartProps) {

  const [showCart, setShowCart] = useState(false)

  return (
    <>
      <AnimatePresence>
        {showCart ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl lg:rounded-xl w-full max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 lg:hidden" />

              <h2 className="text-xl font-bold mb-4">Votre sélection</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Votre panier est vide</p>
                  <Button variant="outline" className="mx-auto" onClick={() => setShowCart(false)}>
                    Parcourir les services
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-auto">
                    {cart.map((item) => (
                      <div key={item.serviceId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.serviceName}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{item.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-600">{item.price.toLocaleString()} FCFA</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeFromCart(item.serviceId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setShowCart(false)}>
                      Continuer
                    </Button>
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={proceedToBooking}>
                      Réserver
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
            <Button
              className={cn(
                "w-full text-white rounded-lg py-6 text-base font-medium relative",
                cart.length > 0 ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-300 cursor-not-allowed",
              )}
              onClick={() => setShowCart(true)}
              disabled={cart.length === 0}
            >
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
              Voir le panier ({cart.reduce((acc, item) => acc + item.price, 0).toLocaleString()} FCFA)
            </Button>
          </div>
        )}
      </AnimatePresence>

    </>
  )
}
