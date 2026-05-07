import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { InsumosPage } from '@/pages/insumos'
import { CatalogoPage } from '@/pages/catalogo'
import { PedidosPage } from '@/pages/pedidos'
import { DashboardPage } from '@/pages/admin/dashboard'
import { StockPage } from '@/pages/admin/stock'
import { ProductosAdminPage } from '@/pages/admin/productos'
import { CheckoutPage } from '@/pages/checkout'
import { MainLayout } from '@/widgets/layout/MainLayout'
import { useAuthStore } from '@/shared/lib/authStore'
import '../index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  }
})

const PrivatePage = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(s => s.token)
  return token ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" replace />
}

export const App = () => {
  const token = useAuthStore((state) => state.token)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />

          <Route path="/" element={
            <PrivatePage>
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍔</p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>¡Bienvenido a Food Store v5.0!</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '1.1rem' }}>
                  Seleccioná una sección del menú lateral para comenzar.
                </p>
              </div>
            </PrivatePage>
          } />

          <Route path="/catalogo" element={<PrivatePage><CatalogoPage /></PrivatePage>} />
          <Route path="/checkout" element={<PrivatePage><CheckoutPage /></PrivatePage>} />
          <Route path="/pedidos" element={<PrivatePage><PedidosPage /></PrivatePage>} />
          <Route path="/insumos" element={<PrivatePage><InsumosPage /></PrivatePage>} />
          <Route path="/admin" element={<PrivatePage><DashboardPage /></PrivatePage>} />
          <Route path="/admin/productos" element={<PrivatePage><ProductosAdminPage /></PrivatePage>} />
          <Route path="/admin/stock" element={<PrivatePage><StockPage /></PrivatePage>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
