import { InsumosTable } from '@/features/insumos/InsumosTable'

export const InsumosPage = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>Gestión de Insumos</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Administrá los ingredientes, marcá alérgenos y exportá a Excel.</p>
      </div>
      
      <InsumosTable />
    </div>
  )
}
