import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductosApi, toggleDisponibilidadApi } from '@/shared/api/api'
import { useCartStore } from '@/shared/lib/cartStore'

export const CatalogoPage = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const limit = 12
  const addItem = useCartStore(s => s.addItem)
  const cartOpen = useCartStore(s => s.itemCount())

  const { data, isLoading } = useQuery({
    queryKey: ['productos', page, search],
    queryFn: () => getProductosApi({ skip: page * limit, limit, search: search || undefined }),
  })

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>Catálogo</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Explorá nuestros productos</p>
        </div>
        <CartBadge count={cartOpen} />
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: '320px', padding: '1.5rem', opacity: 0.5 }}>
              <div style={{ height: '160px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '1rem' }} />
              <div style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }} />
              <div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {data?.items?.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍔</p>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No encontramos productos con ese criterio.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {data?.items?.map((prod: any) => (
                <ProductCard
                  key={prod.id}
                  producto={prod}
                  onAgregar={() => addItem({
                    producto_id: prod.id,
                    nombre: prod.nombre,
                    precio: prod.precio_base,
                    cantidad: 1,
                    imagen_url: prod.imagen_url,
                  })}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ width: 'auto', background: 'rgba(255,255,255,0.1)' }}>← Anterior</button>
            <span style={{ color: '#94a3b8', alignSelf: 'center' }}>Página {page + 1}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!data?.items || data.items.length < limit}
              style={{ width: 'auto', background: 'rgba(255,255,255,0.1)' }}>Siguiente →</button>
          </div>
        </>
      )}
    </div>
  )
}

const CartBadge = ({ count }: { count: number }) => (
  <div style={{ position: 'relative', cursor: 'pointer' }}>
    <span style={{ fontSize: '2rem' }}>🛒</span>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: '-8px', right: '-8px',
        background: 'var(--primary)', color: 'white', borderRadius: '50%',
        width: '22px', height: '22px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700'
      }}>{count}</span>
    )}
  </div>
)

const ProductCard = ({ producto, onAgregar }: { producto: any; onAgregar: () => void }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {producto.imagen_url ? (
      <img src={producto.imagen_url} alt={producto.nombre}
        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
    ) : (
      <div style={{ height: '160px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🍔</div>
    )}
    <div>
      <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{producto.nombre}</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{producto.descripcion}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
          ${producto.precio_base?.toFixed(2)}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
          background: producto.disponible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: producto.disponible ? '#6ee7b7' : '#fca5a5',
        }}>
          {producto.disponible ? 'Disponible' : 'Sin stock'}
        </span>
      </div>
    </div>
    <button onClick={onAgregar} disabled={!producto.disponible}
      style={{ opacity: producto.disponible ? 1 : 0.5 }}>
      Agregar al carrito
    </button>
  </div>
)
