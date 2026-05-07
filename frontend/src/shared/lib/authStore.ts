import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserInfo {
  id: number
  nombre: string
  apellido: string
  email: string
  roles: string[]
}

interface AuthState {
  token: string | null
  user: UserInfo | null
  setToken: (token: string) => void
  setUser: (user: UserInfo) => void
  logout: () => void
  isAdmin: () => boolean
  isClient: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isAdmin: () => {
        const roles = get().user?.roles ?? []
        return roles.some(r => ['ADMIN', 'STOCK', 'PEDIDOS'].includes(r))
      },
      isClient: () => {
        const roles = get().user?.roles ?? []
        return roles.includes('CLIENT') && !roles.includes('ADMIN')
      },
    }),
    { name: 'auth-storage' }
  )
)
