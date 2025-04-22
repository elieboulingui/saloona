// lib/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string) => void;
  clearCart: () => void;
  isInCart: (serviceId: string) => boolean;
  total: () => number;
  totalDuration: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().items.some((i) => i.serviceId === item.serviceId)) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (serviceId) =>
        set({ items: get().items.filter((i) => i.serviceId !== serviceId) }),
      clearCart: () => set({ items: [] }),
      isInCart: (serviceId) =>
        get().items.some((i) => i.serviceId === serviceId),
      total: () =>
        get().items.reduce((acc, item) => acc + item.price, 0),
      totalDuration: () =>
        get().items.reduce((acc, item) => acc + item.duration, 0),
    }),
    {
      name: "cart-storage-service", // nom de la clé dans localStorage
    }
  )
);
