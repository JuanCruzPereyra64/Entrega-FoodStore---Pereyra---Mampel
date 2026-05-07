import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/lib/authStore'
import { apiClient } from '@/shared/api/apiClient'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Login → obtener token
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const loginRes = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const token = loginRes.data.access_token
      setToken(token)

      // 2. Obtener perfil con roles
      const meRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userData = meRes.data
      setUser({
        id: userData.id,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        roles: userData.roles ?? [],
      })

      // 3. Redirigir según rol
      const isAdmin = userData.roles?.some((r: string) => ['ADMIN', 'STOCK', 'PEDIDOS'].includes(r))
      navigate(isAdmin ? '/admin' : '/catalogo', { replace: true })

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel" style={{
      padding: '2.5rem', width: '100%', maxWidth: '420px',
      display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center'
    }}>
      {/* Logo / Título */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.75rem' }}>🍔</p>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>Food Store v5.0</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Ingresá tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
            padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
            textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' }}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="admin@foodstore.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' }}>
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button id="login-submit" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Credenciales de demo */}
      <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          Cuentas de prueba:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <button
            type="button"
            onClick={() => { setEmail('admin@foodstore.com'); setPassword('admin123') }}
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: '0.8rem', padding: '6px 12px', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            👑 Admin — admin@foodstore.com / admin123
          </button>
          <button
            type="button"
            onClick={() => { setEmail('cliente@foodstore.com'); setPassword('cliente123') }}
            style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', fontSize: '0.8rem', padding: '6px 12px', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            👤 Cliente — cliente@foodstore.com / cliente123
          </button>
        </div>
      </div>
    </div>
  )
}
