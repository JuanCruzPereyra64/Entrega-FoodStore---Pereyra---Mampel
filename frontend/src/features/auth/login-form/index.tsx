import { useState } from 'react'
import { useAuthStore } from '@/shared/lib/authStore'
import { apiClient } from '@/shared/api/apiClient'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setToken = useAuthStore((state) => state.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      setToken(response.data.access_token)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>Food Store v5.0</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Ingresá tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' }}>Email</label>
          <input 
            type="email" 
            placeholder="admin@foodstore.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' }}>Contraseña</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '0.5rem' }}>Iniciar Sesión</button>
      </form>
    </div>
  )
}
