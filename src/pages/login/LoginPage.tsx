import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { readErrorMessage } from '../../lib/http'

export function LoginPage() {
  const { isAuthenticated, user, login } = useAuth()
  const [email, setEmail] = useState('admin@kata.com')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/assessments' : '/candidate/assessments'} replace />
  }

  return (
    <div className="login">
      <form
        className="login__card"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          setError(null)
          void login({ email, password })
            .catch((cause) => setError(readErrorMessage(cause, 'No se pudo iniciar sesión')))
            .finally(() => setBusy(false))
        }}
      >
        <h1>Kata Full Stack</h1>
        <p className="muted">Plataforma de evaluación técnica</p>
        <Input id="email" label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button type="submit" disabled={busy}>
          Ingresar
        </Button>
        <div className="login__hint">
          Admin: admin@kata.com / Admin123!
          <br />
          Candidato: candidate@kata.com / Candidato123!
        </div>
      </form>
    </div>
  )
}
