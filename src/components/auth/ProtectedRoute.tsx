import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/auth.store'
import type { UserRole } from '../../types/models'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RoleGate({ role, children }: { role: UserRole; children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/assessments' : '/candidate/assessments'} replace />
  }
  return children
}
