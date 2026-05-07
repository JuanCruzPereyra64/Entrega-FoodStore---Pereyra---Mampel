import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInsumosApi, createInsumoApi, deleteInsumoApi, exportInsumosApi } from '@/shared/api/api'

export const InsumosTable = () => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [newAlergeno, setNewAlergeno] = useState(false)
  const [filterAlergeno, setFilterAlergeno] = useState<'all' | 'true' | 'false'>('all')
  const limit = 10

  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: ['insumos', page, search, filterAlergeno],
    queryFn: () => getInsumosApi({ skip: page * limit, limit, search: search || undefined }),
  })

  // Filtro local de alérgenos (el backend ya filtra por search)
  const filteredItems = (data?.items ?? []).filter((item: any) => {
    if (filterAlergeno === 'all') return true
    return filterAlergeno === 'true' ? item.es_alergeno : !item.es_alergeno
  })

  const createMutation = useMutation({
    mutationFn: createInsumoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] })
      setNewNombre('')
      setNewAlergeno(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInsumoApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insumos'] }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNombre.trim()) return
    createMutation.mutate({ nombre: newNombre.trim(), es_alergeno: newAlergeno })
  }

  const handleExport = () => exportInsumosApi(search || undefined)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Barra superior: búsqueda + filtros + exportar ─────────────────── */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ flex: 1 }}
            id="insumo-search"
          />
          <button type="submit" style={{ width: 'auto', padding: '0 1rem' }}>Buscar</button>
        </form>

        {/* Filtro alérgeno */}
        <select
          value={filterAlergeno}
          onChange={e => { setFilterAlergeno(e.target.value as any); setPage(0) }}
          style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
        >
          <option value="all">Todos</option>
          <option value="true">Solo alérgenos</option>
          <option value="false">Sin alérgenos</option>
        </select>

        <button
          onClick={handleExport}
          style={{ width: 'auto', padding: '0 1.25rem', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}
          title="Exportar tabla a Excel"
        >
          📥 Exportar Excel
        </button>
      </div>

      {/* ── Formulario de alta rápida ─────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1rem', fontWeight: '600' }}>➕ Nuevo Insumo</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Nombre del Ingrediente *</label>
            <input
              id="insumo-nombre"
              type="text"
              value={newNombre}
              onChange={e => setNewNombre(e.target.value)}
              placeholder="Ej: Queso Cheddar"
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '2px' }}>
            <input
              id="insumo-alergeno"
              type="checkbox"
              checked={newAlergeno}
              onChange={e => setNewAlergeno(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="insumo-alergeno" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>Es Alérgeno</label>
          </div>
          <button
            type="submit"
            id="insumo-crear-btn"
            style={{ width: 'auto' }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Añadiendo...' : 'Añadir'}
          </button>
        </form>
        {createMutation.isError && (
          <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Error: {(createMutation.error as any)?.response?.data?.detail || 'No se pudo crear el insumo'}
          </p>
        )}
      </div>

      {/* ── Tabla de insumos ──────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isPending ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</p>
            <p>Cargando insumos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧂</p>
            <p>No se encontraron insumos.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.875rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alérgeno</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Alta</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>#{item.id}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{item.nombre}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      background: item.es_alergeno ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                      color: item.es_alergeno ? '#fca5a5' : '#6ee7b7',
                      border: `1px solid ${item.es_alergeno ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    }}>
                      {item.es_alergeno ? '⚠ Alérgeno' : '✓ Seguro'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      id={`insumo-baja-${item.id}`}
                      onClick={() => {
                        if (window.confirm(`¿Dar de baja "${item.nombre}"?\n\nEsta es una baja lógica: el registro no se elimina de la base de datos.`)) {
                          deleteMutation.mutate(item.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      style={{
                        width: 'auto',
                        padding: '5px 14px',
                        fontSize: '0.82rem',
                        background: 'rgba(239,68,68,0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239,68,68,0.3)',
                      }}
                      title="Baja lógica: el insumo no se elimina físicamente"
                    >
                      🗑 Baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Total registros activos: <strong style={{ color: '#94a3b8' }}>{data?.total ?? 0}</strong>
            {search && <span style={{ marginLeft: '0.5rem', color: '#6366f1' }}>· filtrando por "{search}"</span>}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              id="insumos-prev"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ width: 'auto', padding: '6px 16px', background: 'rgba(255,255,255,0.08)', opacity: page === 0 ? 0.4 : 1 }}
            >
              ← Anterior
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', minWidth: '80px', textAlign: 'center' }}>
              Pág. {page + 1}
            </span>
            <button
              id="insumos-next"
              onClick={() => setPage(p => p + 1)}
              disabled={!data || data.items.length < limit}
              style={{ width: 'auto', padding: '6px 16px', background: 'rgba(255,255,255,0.08)', opacity: !data || data.items.length < limit ? 0.4 : 1 }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
