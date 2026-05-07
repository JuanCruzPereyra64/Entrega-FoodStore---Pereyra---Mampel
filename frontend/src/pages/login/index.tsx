import { LoginForm } from '@/features/auth/login-form'

export const LoginPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      <LoginForm />
    </div>
  )
}
