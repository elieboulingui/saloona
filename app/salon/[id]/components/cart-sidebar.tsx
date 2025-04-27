"use client"

import { Button } from "@/components/ui/button"
import { Clock, MapPin, ShoppingCart } from "lucide-react"
import type { CartItem } from "@/types/cart"

interface CartSidebarProps {
  cart: CartItem[]
  total: () => number
  removeFromCart: (serviceId: string) => void
  proceedToBooking: () => void
  address: string
}

export function CartSidebar({ cart, total, removeFromCart, proceedToBooking, address }: CartSidebarProps) {
  return (
    <div className="sticky top-6 border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Aucun service sélectionné</p>
            <p className="text-gray-400 text-sm mt-1">Sélectionnez des services pour réserver</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-60 overflow-auto">
              {cart.map((item) => (
                <div key={item.serviceId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.serviceName}</p>
                    <p className="text-sm text-gray-500">{item.duration} min</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.price.toLocaleString()} FCFA</p>
                    <button className="text-red-500 text-sm" onClick={() => removeFromCart(item.serviceId)}>
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-semibold">
              <span>Total</span>
              <span>{total().toLocaleString()} FCFA</span>
            </div>

            <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white" onClick={proceedToBooking}>
              Continuer la réservation
            </Button>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <span className="font-medium flex items-center">
                Fermé
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-start">
            <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">{address}</p>
              <a href="#" className="text-blue-600 text-sm">
                Afficher l'itinéraire
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
