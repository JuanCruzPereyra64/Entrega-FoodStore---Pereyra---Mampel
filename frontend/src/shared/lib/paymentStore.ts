import { create } from 'zustand'

type PaymentStatus = 'idle' | 'processing' | 'approved' | 'rejected' | 'error'

interface PaymentState {
  status: PaymentStatus
  mpPaymentId: number | null
  statusDetail: string | null
  setPaymentStatus: (status: PaymentStatus, detail?: string | null, id?: number | null) => void
  reset: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  status: 'idle',
  mpPaymentId: null,
  statusDetail: null,
  setPaymentStatus: (status, detail = null, id = null) =>
    set({ status, statusDetail: detail, mpPaymentId: id }),
  reset: () => set({ status: 'idle', mpPaymentId: null, statusDetail: null }),
}))
