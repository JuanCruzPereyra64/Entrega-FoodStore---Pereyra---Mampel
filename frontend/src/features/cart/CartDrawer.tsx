import { useCartStore } from '@/shared/lib/cartStore'
import { useUIStore } from '@/shared/lib/uiStore'
import { useNavigate } from 'react-router-dom'

export const CartDrawer = () => {
  const { cartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateCantidad, subtotal, costoEnvio, total, clearCart } = useCartStore()
  const navigate = useNavigate()

  if (!cartOpen) return null

  return (
    <>
      <div 
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90
        }}
      />
      <div className="glass-panel" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw',
        zIndex: 100, padding: '2rem', display: 'flex', flexDirection: 'column',
        borderRadius: 0, borderRight: 'none', borderTop: 'none', borderBottom: 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Tu Carrito</h2>
          <button onClick={closeCart} style={{ background: 'transparent', width: 'auto', padding: '0.5rem' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.producto_id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍔</div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '600' }}>{item.nombre}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: '700' }}>${item.precio.toFixed(2)}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                      <button onClick={() => updateCantidad(item.producto_id, item.cantidad - 1)} style={{ background: 'transparent', padding: 0, width: '20px' }}>-</button>
                      <span style={{ fontSize: '0.9rem' }}>{item.cantidad}</span>
                      <button onClick={() => updateCantidad(item.producto_id, item.cantidad + 1)} style={{ background: 'transparent', padding: 0, width: '20px' }}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.producto_id)} style={{ background: 'transparent', color: '#fca5a5', padding: 0, fontSize: '0.8rem', width: 'auto' }}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
              <span>Subtotal</span>
              <span>${subtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#94a3b8' }}>
              <span>Costo de envío</span>
              <span>${costoEnvio().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${total().toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => {
                closeCart()
                navigate('/checkout')
              }} style={{ background: 'var(--primary)', color: 'white' }}>
                Proceder al pago
              </button>
              <button onClick={clearCart} style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
