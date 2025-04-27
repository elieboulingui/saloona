"use client"

import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  id: string
  name: string
  duration: string
  price: string
  isInCart: boolean
  onToggleCart: () => void
}

export function ServiceCard({ id, name, duration, price, isInCart, onToggleCart }: ServiceCardProps) {
  return (
    <div className="border-t border-gray-100 py-6 first:border-t-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-base">{name}</h3>
          <div className="text-sm text-gray-500 mt-1">{duration} min</div>
          <div className="text-sm text-gray-500 mt-1">à partir de {Number.parseInt(price).toLocaleString()} FCFA</div>
        </div>
        <Button
          variant="outline"
          className={`rounded-full border-gray-300 px-5 font-bold ${isInCart ? "border-red-500 text-red-500" : "border-gray-500"}`}
          onClick={onToggleCart}
        >
          {isInCart ? "-" : "+"}
        </Button>
      </div>
    </div>
  )
}
