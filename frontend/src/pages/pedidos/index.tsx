import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPedidosApi, avanzarEstadoApi, getHistorialApi } from '@/shared/api/api'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  EN_PREP: '#06b6d4',
  EN_CAMINO: '#8b5cf6',
  ENTREGADO: '#10b981',
  CANCELADO: '#ef4444',
}

export const PedidosPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const limit = 10
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos', page],
    queryFn: () => getPedidosApi({ skip: page * limit, limit }),
    refetchInterval: 30_000, // polling cada 30s
  })

  const { data: historial } = useQuery({
    queryKey: ['historial', selectedId],
    queryFn: () => getHistorialApi(selectedId!),
    enabled: !!selectedId,
  })

  const avanzarMutation = useMutation({
    mutationFn: ({ id, payload }: any) => avanzarEstadoApi(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  })

  const TRANSICIONES: Record<string, string[]> = {
    PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['EN_PREP', 'CANCELADO'],
    EN_PREP: ['EN_CAMINO', 'CANCELADO'],
    EN_CAMINO: ['ENTREGADO'],
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* Lista */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
          Gestión de Pedidos
        </h1>

        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {isLoading ? <p>Cargando...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Fecha</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((p: any) => {
                  const color = ESTADO_COLORS[p.estado_codigo] || '#94a3b8'
                  const siguientes = TRANSICIONES[p.estado_codigo] || []
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: selectedId === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer'
                    }} onClick={() => setSelectedId(p.id)}>
                      <td style={{ padding: '1rem' }}>#{p.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: `${color}22`, color, padding: '4px 10px',
                          borderRadius: '12px', fontSize: '0.8rem' }}>
                          {p.estado_codigo}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>${p.total?.toFixed(2)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        {new Date(p.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {siguientes.map(estado => (
                          <button key={estado}
                            onClick={(e) => {
                              e.stopPropagation()
                              const motivo = estado === 'CANCELADO' ? prompt('Motivo de cancelación:') : undefined
                              avanzarMutation.mutate({ id: p.id, payload: { nuevo_estado: estado, motivo } })
                            }}
                            style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem',
                              background: estado === 'CANCELADO' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                              color: estado === 'CANCELADO' ? '#fca5a5' : '#93c5fd' }}>
                            → {estado}
                          </button>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ width: 'auto', background: 'rgba(255,255,255,0.1)' }}>← Anterior</button>
            <button onClick={() => setPage(p => p + 1)} disabled={!data?.items || data.items.length < limit}
              style={{ width: 'auto', background: 'rgba(255,255,255,0.1)' }}>Siguiente →</button>
          </div>
        </div>
      </div>

      {/* Panel Historial */}
      {selectedId && (
        <div className="glass-panel" style={{ width: '320px', padding: '1.5rem', flexShrink: 0 }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Historial #{selectedId}</h3>
          {historial?.map((h: any, i: number) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px',
                background: ESTADO_COLORS[h.estado_hacia] || '#94a3b8', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  {h.estado_desde ? `${h.estado_desde} → ` : ''}{h.estado_hacia}
                </p>
                {h.motivo && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{h.motivo}</p>}
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {new Date(h.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
