// types/product.ts
export interface Product {
    id: string
    name: string
    description: string
    price: number
    stock: number
    image: string | null
    categoryId: string
    organizationId: string
    createdAt: string
    updatedAt: string
    category: {
      id: string
      name: string
    }
  }
  
  export interface Category {
    id: string
    name: string
    organizationId: string
  }
  