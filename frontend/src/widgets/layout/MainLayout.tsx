import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/lib/authStore'

interface MainLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/', label: '🏠 Inicio', match: (p: string) => p === '/' },
  { to: '/catalogo', label: '🛍️ Catálogo', match: (p: string) => p.startsWith('/catalogo') },
  { to: '/pedidos', label: '📦 Pedidos', match: (p: string) => p.startsWith('/pedidos') },
  { to: '/insumos', label: '🧂 Insumos', match: (p: string) => p.startsWith('/insumos') },
  { to: '/admin', label: '📊 Dashboard', match: (p: string) => p === '/admin' },
  { to: '/admin/productos', label: '🍔 Productos', match: (p: string) => p.startsWith('/admin/productos') },
  { to: '/admin/stock', label: '📦 Stock', match: (p: string) => p.startsWith('/admin/stock') },
]

export const MainLayout = ({ children }: MainLayoutProps) => {
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{
        width: '250px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem', textAlign: 'center' }}>
            🍔 Food Store
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>v5.0 Admin</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.to} to={item.to} style={{
              padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
              color: item.match(location.pathname) ? 'white' : '#cbd5e1',
              background: item.match(location.pathname) ? 'var(--primary)' : 'transparent',
              fontWeight: '500', transition: 'all 0.2s', fontSize: '0.9rem',
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={logout} style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', marginTop: 'auto' }}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', maxHeight: '100vh', position: 'relative' }}>
        {children}
      </main>

      <CartDrawer />
    </div>
  )
}
