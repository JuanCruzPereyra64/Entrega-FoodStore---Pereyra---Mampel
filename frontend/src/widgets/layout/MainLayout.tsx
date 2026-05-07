import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/lib/authStore'
import { CartDrawer } from '@/features/cart/CartDrawer'
import { useCartStore } from '@/shared/lib/cartStore'
import { useUIStore } from '@/shared/lib/uiStore'

interface MainLayoutProps {
  children: ReactNode
}

const ADMIN_NAV = [
  { to: '/admin',           label: '📊 Dashboard',  match: (p: string) => p === '/admin' },
  { to: '/admin/productos', label: '🍔 Productos',   match: (p: string) => p.startsWith('/admin/productos') },
  { to: '/admin/stock',     label: '📦 Stock',        match: (p: string) => p.startsWith('/admin/stock') },
  { to: '/insumos',         label: '🧂 Insumos',      match: (p: string) => p.startsWith('/insumos') },
  { to: '/pedidos',         label: '🗂️ Pedidos',       match: (p: string) => p.startsWith('/pedidos') },
]

const CLIENT_NAV = [
  { to: '/catalogo', label: '🛍️ Catálogo',   match: (p: string) => p.startsWith('/catalogo') },
  { to: '/pedidos',  label: '📦 Mis Pedidos', match: (p: string) => p.startsWith('/pedidos') },
  { to: '/checkout', label: '💳 Checkout',    match: (p: string) => p.startsWith('/checkout') },
]

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { logout, user, isAdmin } = useAuthStore()
  const location = useLocation()
  const itemCount = useCartStore(s => s.itemCount())
  const openCart = useUIStore(s => s.openCart)

  const adminMode = isAdmin()
  const navItems = adminMode ? ADMIN_NAV : CLIENT_NAV
  const subtitle = adminMode ? 'v5.0 · Panel Admin' : 'v5.0 · Mi cuenta'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-color)' }}>

      {/* Sidebar */}
      <aside className="glass-panel" style={{
        width: '250px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.4rem' }}>
            🍔 Food Store
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>{subtitle}</p>
        </div>

        {/* Usuario */}
        {user && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.6rem 0.8rem',
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.25rem'
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
              {adminMode ? '👑' : '👤'} {user.nombre} {user.apellido}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{user.email}</p>
            <p style={{ fontSize: '0.72rem', color: adminMode ? '#a5b4fc' : '#6ee7b7', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user.roles.join(', ')}
            </p>
          </div>
        )}

        {/* Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexGrow: 1 }}>
          {navItems.map(item => {
            const active = item.match(location.pathname)
            return (
              <Link key={item.to} to={item.to} style={{
                padding: '0.7rem 1rem', borderRadius: '8px', textDecoration: 'none',
                color: active ? 'white' : '#94a3b8',
                background: active ? 'var(--primary)' : 'transparent',
                fontWeight: active ? '600' : '400',
                fontSize: '0.9rem',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Carrito (solo clientes) */}
        {!adminMode && (
          <button
            onClick={openCart}
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', position: 'relative', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            🛒 Carrito
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--primary)', color: 'white', borderRadius: '50%',
                width: '22px', height: '22px', fontSize: '0.72rem', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{itemCount}</span>
            )}
          </button>
        )}

        {/* Cerrar sesión */}
        <button onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>

      <CartDrawer />
    </div>
  )
}
