import { apiClient } from './apiClient'

export interface Insumo {
  id: int
  nombre: string
  es_alergeno: boolean
}

export const getInsumos = async (skip: number = 0, limit: number = 10, search: string = '') => {
  const { data } = await apiClient.get('/insumos/', {
    params: { skip, limit, search }
  })
  return data
}

export const createInsumo = async (insumo: Omit<Insumo, 'id'>) => {
  const { data } = await apiClient.post('/insumos/', insumo)
  return data
}

export const updateInsumo = async (id: number, insumo: Partial<Insumo>) => {
  const { data } = await apiClient.put(`/insumos/${id}`, insumo)
  return data
}

export const deleteInsumo = async (id: number) => {
  const { data } = await apiClient.delete(`/insumos/${id}`)
  return data
}

export const exportInsumos = async (search: string = '') => {
  const response = await apiClient.get('/insumos/export', {
    params: { search },
    responseType: 'blob'
  })
  
  // Crear un link temporal para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'insumos.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
