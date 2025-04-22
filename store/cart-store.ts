// store/cart-product-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ProductCartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ProductCartState {
  items: ProductCartItem[]
  addItem: (item: ProductCartItem) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getQuantity: (productId: string) => number
  total: () => number
  totalItems: () => number
}

export const useProductCartStore = create<ProductCartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.productId === item.productId)

        if (existingItem) {
          set({
            items: get().items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) })
        } else {
          set({
            items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
          })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      clearCart: () => set({ items: [] }),
      isInCart: (productId) => get().items.some((i) => i.productId === productId),
      getQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId)
        return item ? item.quantity : 0
      },
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "product-cart-storage", // nom de la clé dans localStorage
    },
  ),
)
