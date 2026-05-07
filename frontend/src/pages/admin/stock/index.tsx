import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStockApi, updateStockApi } from '@/shared/api/api'

export const StockPage = () => {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['stock'], queryFn: getStockApi })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => updateStockApi(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  })

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
        Gestión de Stock
      </h1>
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isLoading ? <p>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Producto</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Disponible</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p: any) => (
                <StockRow key={p.id} producto={p} onUpdate={(payload: any) =>
                  updateMutation.mutate({ id: p.id, payload })} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const StockRow = ({ producto, onUpdate }: { producto: any; onUpdate: (p: any) => void }) => {
  const [stock, setStock] = useState(producto.stock_cantidad)

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '1rem', fontWeight: '500' }}>{producto.nombre}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="number" value={stock} min={0}
            onChange={e => setStock(Number(e.target.value))}
            style={{ width: '80px', padding: '6px', textAlign: 'center' }} />
          <button onClick={() => onUpdate({ stock_cantidad: stock })}
            style={{ width: 'auto', padding: '6px 12px', background: 'var(--primary)', fontSize: '0.8rem' }}>
            Guardar
          </button>
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <button
          onClick={() => onUpdate({ disponible: !producto.disponible })}
          style={{
            width: 'auto', padding: '4px 12px', fontSize: '0.85rem',
            background: producto.disponible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
            color: producto.disponible ? '#6ee7b7' : '#fca5a5',
          }}>
          {producto.disponible ? '✓ Activo' : '✗ Inactivo'}
        </button>
      </td>
      <td style={{ padding: '1rem', color: '#94a3b8' }}>${producto.precio_base?.toFixed(2)}</td>
    </tr>
  )
}
