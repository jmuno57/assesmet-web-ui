import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { readErrorMessage } from '../lib/http'
import { authService } from '../services/api'
import { emitSessionEnded, useAuthStore } from '../store/auth.store'
import type { LoginPayload } from '../types/models'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigate = useNavigate()

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await authService.login(payload)
      setSession(session)
      navigate(session.user.role === 'admin' ? '/admin/assessments' : '/candidate/assessments', { replace: true })
    },
    [navigate, setSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      void readErrorMessage(error)
    } finally {
      clearSession()
      emitSessionEnded()
      navigate('/login', { replace: true })
    }
  }, [clearSession, navigate])

  return {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  }
}
