import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductosApi, createProductoApi, updateProductoApi, deleteProductoApi, toggleDisponibilidadApi, getCategoriasApi } from '@/shared/api/api'

export const ProductosAdminPage = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const limit = 10
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-productos', page, search],
    queryFn: () => getProductosApi({ skip: page * limit, limit, search: search || undefined }),
  })

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategoriasApi })

  const deleteMutation = useMutation({
    mutationFn: deleteProductoApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-productos'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, disponible }: any) => toggleDisponibilidadApi(id, disponible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-productos'] }),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>Productos</h1>
        <button style={{ width: 'auto' }} onClick={() => { setEditing(null); setShowModal(true) }}>
          + Nuevo Producto
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <input placeholder="Buscar productos..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }} />
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isLoading ? <p>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Precio</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Disponible</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{p.nombre}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.descripcion}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>${p.precio_base?.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>{p.stock_cantidad}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => toggleMutation.mutate({ id: p.id, disponible: !p.disponible })}
                      style={{
                        width: 'auto', padding: '4px 12px', fontSize: '0.8rem',
                        background: p.disponible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: p.disponible ? '#6ee7b7' : '#fca5a5',
                      }}>
                      {p.disponible ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setEditing(p); setShowModal(true) }}
                      style={{ width: 'auto', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '4px 12px', fontSize: '0.8rem' }}>
                      Editar
                    </button>
                    <button onClick={() => {
                      if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMutation.mutate(p.id)
                    }} style={{ width: 'auto', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '4px 12px', fontSize: '0.8rem' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
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

      {showModal && (
        <ProductoModal
          editing={editing}
          categorias={categorias || []}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries({ queryKey: ['admin-productos'] }) }}
        />
      )}
    </div>
  )
}

const ProductoModal = ({ editing, categorias, onClose, onSaved }: any) => {
  const [form, setForm] = useState({
    nombre: editing?.nombre || '',
    descripcion: editing?.descripcion || '',
    precio_base: editing?.precio_base?.toString() || '',
    imagen_url: editing?.imagen_url || '',
    stock_cantidad: editing?.stock_cantidad?.toString() || '',
    categoria_ids: editing?.categoria_ids || [],
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        precio_base: Number(form.precio_base) || 0,
        stock_cantidad: Number(form.stock_cantidad) || 0
      }
      return editing
        ? updateProductoApi(editing.id, payload)
        : createProductoApi(payload)
    },
    onSuccess: onSaved,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel" style={{ padding: '2rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
          {editing ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
          <div><label>Descripción</label>
            <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
          <div><label>Precio</label>
            <input type="number" value={form.precio_base} onChange={e => setForm(f => ({ ...f, precio_base: e.target.value }))} /></div>
          <div><label>Stock</label>
            <input type="number" value={form.stock_cantidad} onChange={e => setForm(f => ({ ...f, stock_cantidad: e.target.value }))} /></div>
          <div><label>URL Imagen</label>
            <input value={form.imagen_url} onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))} /></div>
        </div>

        {saveMutation.isError && (
          <div style={{ color: '#fca5a5', marginTop: '1rem', fontSize: '0.9rem' }}>
            Error al guardar: {(saveMutation.error as any)?.response?.data?.detail || 'Revisá los datos ingresados.'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
