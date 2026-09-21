import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '../../store/auth.store'

describe('ProtectedRoute', () => {
  it('redirects to login when there is no session', () => {
    useAuthStore.setState({ token: null, user: null })
    render(
      <MemoryRouter initialEntries={['/admin/assessments']}>
        <Routes>
          <Route path="/login" element={<p>Login</p>} />
          <Route
            path="/admin/assessments"
            element={
              <ProtectedRoute>
                <p>Privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renders children when the token exists', () => {
    useAuthStore.setState({ token: 'jwt', user: null })
    render(
      <MemoryRouter initialEntries={['/admin/assessments']}>
        <Routes>
          <Route path="/login" element={<p>Login</p>} />
          <Route
            path="/admin/assessments"
            element={
              <ProtectedRoute>
                <p>Privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Privado')).toBeInTheDocument()
  })
})
