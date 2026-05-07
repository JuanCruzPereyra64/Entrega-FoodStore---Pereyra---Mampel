import { create } from 'zustand'

interface ConfirmModal {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
}

interface UIState {
  cartOpen: boolean
  sidebarOpen: boolean
  confirmModal: ConfirmModal | null
  openCart: () => void
  closeCart: () => void
  toggleSidebar: () => void
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void
  closeConfirmModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  sidebarOpen: true,
  confirmModal: null,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openConfirmModal: (title, message, onConfirm) =>
    set({ confirmModal: { open: true, title, message, onConfirm } }),
  closeConfirmModal: () => set({ confirmModal: null }),
}))
