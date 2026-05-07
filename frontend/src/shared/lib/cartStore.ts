import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
  imagen_url?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (producto_id: number) => void
  updateCantidad: (producto_id: number, cantidad: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
  costoEnvio: () => number
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existing = items.find(i => i.producto_id === item.producto_id)
        if (existing) {
          set({ items: items.map(i => i.producto_id === item.producto_id
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
          )})
        } else {
          set({ items: [...items, item] })
        }
      },
      removeItem: (producto_id) => set({ items: get().items.filter(i => i.producto_id !== producto_id) }),
      updateCantidad: (producto_id, cantidad) => {
        if (cantidad < 1) return
        set({ items: get().items.map(i => i.producto_id === producto_id ? { ...i, cantidad } : i) })
      },
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
      costoEnvio: () => get().items.length > 0 ? 50 : 0,
      total: () => get().subtotal() + get().costoEnvio(),
    }),
    { name: 'foodstore-cart', version: 1 }
  )
)
