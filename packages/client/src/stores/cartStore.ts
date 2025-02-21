// src/stores/cartStore.ts
import { create } from 'zustand'

interface Book {
  id: string
  title: string
  description: string
  price: number
  author?: string
}

interface CartState {
  items: Book[]
  addToCart: (book: Book) => void
  removeFromCart: (bookId: string) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  addToCart: (book) => set((state) => ({ 
    items: [...state.items, book] 
  })),
  removeFromCart: (bookId) => set((state) => ({
    items: state.items.filter(item => item.id !== bookId)
  })),
  clearCart: () => set({ items: [] }),
  totalPrice: () => get().items.reduce((sum, item) => sum + Number(item.price), 0)
}))