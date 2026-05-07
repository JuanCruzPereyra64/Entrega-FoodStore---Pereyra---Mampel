import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInsumosApi as getInsumos, createInsumoApi as createInsumo, deleteInsumoApi as deleteInsumo, exportInsumosApi as exportInsumos } from '@/shared/api/api'

export const InsumosTable = () => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [newAlergeno, setNewAlergeno] = useState(false)
  const limit = 10

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['insumos', page, search],
    queryFn: () => getInsumos({ skip: page * limit, limit, search }),
    keepPreviousData: true
  })

  const createMutation = useMutation({
    mutationFn: createInsumo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insumos'] })
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInsumo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insumos'] })
  })

  const handleExport = () => {
    exportInsumos(search)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNombre) return
    createMutation.mutate({ nombre: newNombre, es_alergeno: newAlergeno })
    setNewNombre('')
    setNewAlergeno(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Controles: Buscar y Exportar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '300px' }}
        />
        <button onClick={handleExport} style={{ width: 'auto', background: '#10b981' }}>
          Exportar a Excel
        </button>
      </div>

      {/* Formulario de Alta Rápida */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Nuevo Insumo</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre del Ingrediente</label>
            <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '45px' }}>
            <input type="checkbox" checked={newAlergeno} onChange={(e) => setNewAlergeno(e.target.checked)} style={{ width: '20px' }} />
            <label style={{ fontSize: '0.9rem' }}>Es Alérgeno</label>
          </div>
          <button type="submit" style={{ width: 'auto' }} disabled={createMutation.isLoading}>
            Añadir
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isLoading ? (
          <p>Cargando insumos...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Alérgeno</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{item.id}</td>
                  <td style={{ padding: '1rem' }}>{item.nombre}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: item.es_alergeno ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: item.es_alergeno ? '#fca5a5' : '#6ee7b7'
                    }}>
                      {item.es_alergeno ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => { if(window.confirm('¿Seguro que querés dar de baja este insumo?')) deleteMutation.mutate(item.id) }}
                      style={{ background: 'transparent', color: 'var(--danger)', width: 'auto', padding: '0' }}
                    >
                      Baja
                    </button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No hay insumos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Total: {data?.total || 0}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              disabled={page === 0}
              style={{ width: 'auto', padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={!data || data.items.length < limit}
              style={{ width: 'auto', padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
