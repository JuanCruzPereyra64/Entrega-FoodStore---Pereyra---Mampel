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

// Wrapper que redirige al login si no hay token
const PrivatePage = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(s => s.token)
  return token
    ? <MainLayout>{children}</MainLayout>
    : <Navigate to="/login" replace />
}

// Wrapper que solo permite el acceso a roles admin
const AdminPage = ({ children }: { children: React.ReactNode }) => {
  const { token, isAdmin } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/catalogo" replace />
  return <MainLayout>{children}</MainLayout>
}

export const App = () => {
  const { token, isAdmin } = useAuthStore()
  const defaultPath = token ? (isAdmin() ? '/admin' : '/catalogo') : '/login'

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={!token ? <LoginPage /> : <Navigate to={defaultPath} replace />}
          />

          {/* Home → redirige según rol */}
          <Route path="/" element={<Navigate to={defaultPath} replace />} />

          {/* Rutas de Cliente */}
          <Route path="/catalogo"  element={<PrivatePage><CatalogoPage /></PrivatePage>} />
          <Route path="/pedidos"   element={<PrivatePage><PedidosPage /></PrivatePage>} />
          <Route path="/checkout"  element={<PrivatePage><CheckoutPage /></PrivatePage>} />

          {/* Rutas exclusivas de Admin */}
          <Route path="/insumos"         element={<AdminPage><InsumosPage /></AdminPage>} />
          <Route path="/admin"           element={<AdminPage><DashboardPage /></AdminPage>} />
          <Route path="/admin/productos" element={<AdminPage><ProductosAdminPage /></AdminPage>} />
          <Route path="/admin/stock"     element={<AdminPage><StockPage /></AdminPage>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
