import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { OrganizationDetails } from "@/types/organization"

interface RecentlyViewedState {
  items: OrganizationDetails[]
  addItem: (item: OrganizationDetails) => void
  clearItems: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          // Filtrer les doublons
          const filteredItems = state.items.filter((i) => i.id !== item.id)
          // Ajouter le nouvel élément au début et limiter à 10 éléments
          return { items: [item, ...filteredItems].slice(0, 10) }
        })
      },
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "recently-viewed-salons",
    },
  ),
)
