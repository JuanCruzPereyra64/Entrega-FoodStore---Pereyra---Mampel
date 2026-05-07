import { useQuery } from '@tanstack/react-query'
import { getDashboardApi } from '@/shared/api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b', CONFIRMADO: '#3b82f6', EN_PREP: '#06b6d4',
  EN_CAMINO: '#8b5cf6', ENTREGADO: '#10b981', CANCELADO: '#ef4444',
}

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardApi,
    refetchInterval: 60_000,
  })

  if (isLoading) return <p>Cargando dashboard...</p>

  const chartData = Object.entries(data?.pedidos_por_estado || {}).map(([estado, count]) => ({
    estado, count,
  }))

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '2rem' }}>
        Dashboard
      </h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <KPICard label="Pedidos Hoy" value={data?.pedidos_hoy || 0} icon="📦" />
        <KPICard label="Ingresos Hoy" value={`$${(data?.ingresos_hoy || 0).toFixed(2)}`} icon="💰" />
        <KPICard label="Productos Activos" value={data?.productos_activos || 0} icon="🍔" />
        <KPICard label="Usuarios" value={data?.usuarios_activos || 0} icon="👥" />
      </div>

      {/* Gráfico */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Pedidos por Estado</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="estado" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
              labelStyle={{ color: 'white' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.estado} fill={COLORS[entry.estado] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimos pedidos */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Últimos Pedidos</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Estado</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data?.ultimos_pedidos?.map((p: any) => {
              const color = COLORS[p.estado] || '#94a3b8'
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>#{p.id}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ background: `${color}22`, color, padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>${p.total?.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {new Date(p.created_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const KPICard = ({ label, value, icon }: { label: string; value: any; icon: string }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)' }}>{value}</div>
    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
  </div>
)
