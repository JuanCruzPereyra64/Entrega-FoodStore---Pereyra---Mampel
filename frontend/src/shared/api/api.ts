import { apiClient } from './apiClient'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi = async (email: string, password: string) => {
  const form = new FormData()
  form.append('username', email)
  form.append('password', password)
  const { data } = await apiClient.post('/auth/login', form)
  return data
}

export const registerApi = async (payload: {
  nombre: string; apellido: string; email: string; password: string; celular?: string
}) => {
  const { data } = await apiClient.post('/auth/register', payload)
  return data
}

export const getMeApi = async () => {
  const { data } = await apiClient.get('/auth/me')
  return data
}

// ── Categorias ────────────────────────────────────────────────────────────────
export const getCategoriasApi = async () => {
  const { data } = await apiClient.get('/categorias/')
  return data
}

export const createCategoriaApi = async (payload: any) => {
  const { data } = await apiClient.post('/categorias/', payload)
  return data
}

export const updateCategoriaApi = async (id: number, payload: any) => {
  const { data } = await apiClient.put(`/categorias/${id}`, payload)
  return data
}

export const deleteCategoriaApi = async (id: number) => {
  await apiClient.delete(`/categorias/${id}`)
}

// ── Productos ─────────────────────────────────────────────────────────────────
export const getProductosApi = async (params?: {
  skip?: number; limit?: number; search?: string; disponible?: boolean
}) => {
  const { data } = await apiClient.get('/productos/', { params })
  return data
}

export const getProductoApi = async (id: number) => {
  const { data } = await apiClient.get(`/productos/${id}`)
  return data
}

export const createProductoApi = async (payload: any) => {
  const { data } = await apiClient.post('/productos/', payload)
  return data
}

export const updateProductoApi = async (id: number, payload: any) => {
  const { data } = await apiClient.put(`/productos/${id}`, payload)
  return data
}

export const toggleDisponibilidadApi = async (id: number, disponible: boolean) => {
  const { data } = await apiClient.patch(`/productos/${id}/disponibilidad`, null, {
    params: { disponible }
  })
  return data
}

export const deleteProductoApi = async (id: number) => {
  await apiClient.delete(`/productos/${id}`)
}

// ── Insumos ──────────────────────────────────────────────────────────────────
export const getInsumosApi = async (params?: { skip?: number; limit?: number; search?: string }) => {
  const { data } = await apiClient.get('/insumos/', { params })
  return data
}

export const createInsumoApi = async (payload: any) => {
  const { data } = await apiClient.post('/insumos/', payload)
  return data
}

export const deleteInsumoApi = async (id: number) => {
  const { data } = await apiClient.delete(`/insumos/${id}`)
  return data
}

export const exportInsumosApi = async (search?: string) => {
  const response = await apiClient.get('/insumos/export', { params: { search }, responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'insumos.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ── Formas de Pago ─────────────────────────────────────────────────────────────
export const getFormasPagoApi = async () => {
  const { data } = await apiClient.get('/formas-pago/')
  return data
}

// ── Pedidos ───────────────────────────────────────────────────────────────────
export const getPedidosApi = async (params?: { skip?: number; limit?: number }) => {
  const { data } = await apiClient.get('/pedidos/', { params })
  return data
}

export const getPedidoApi = async (id: number) => {
  const { data } = await apiClient.get(`/pedidos/${id}`)
  return data
}

export const crearPedidoApi = async (payload: any) => {
  const { data } = await apiClient.post('/pedidos/', payload)
  return data
}

export const avanzarEstadoApi = async (id: number, payload: any) => {
  const { data } = await apiClient.patch(`/pedidos/${id}/estado`, payload)
  return data
}

export const cancelarPedidoApi = async (id: number) => {
  const { data } = await apiClient.delete(`/pedidos/${id}`)
  return data
}

export const getHistorialApi = async (id: number) => {
  const { data } = await apiClient.get(`/pedidos/${id}/historial`)
  return data
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getDashboardApi = async () => {
  const { data } = await apiClient.get('/admin/dashboard')
  return data
}

export const getStockApi = async () => {
  const { data } = await apiClient.get('/admin/stock')
  return data
}

export const updateStockApi = async (id: number, payload: any) => {
  const { data } = await apiClient.patch(`/admin/stock/${id}`, payload)
  return data
}

export const getUsuariosApi = async (params?: { skip?: number; limit?: number }) => {
  const { data } = await apiClient.get('/admin/usuarios', { params })
  return data
}
