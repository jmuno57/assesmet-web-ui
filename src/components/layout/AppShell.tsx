import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useIdleLogout } from '../../hooks/useIdleLogout'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Feedback'

export function AppShell() {
  const { user, logout } = useAuth()
  useIdleLogout()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="shell">
      <aside className="shell__aside">
        <div className="shell__brand">KATA FULL STACK</div>
        <nav className="shell__nav">
          {isAdmin ? (
            <>
              <NavLink className={({ isActive }) => `shell__link${isActive ? ' is-active' : ''}`} to="/admin/assessments">
                Assessments
              </NavLink>
              <NavLink className={({ isActive }) => `shell__link${isActive ? ' is-active' : ''}`} to="/admin/submissions">
                Resultados
              </NavLink>
              <NavLink className={({ isActive }) => `shell__link${isActive ? ' is-active' : ''}`} to="/admin/security">
                Ejecución segura
              </NavLink>
            </>
          ) : (
            <NavLink
              className={({ isActive }) => `shell__link${isActive ? ' is-active' : ''}`}
              to="/candidate/assessments"
            >
              Mis evaluaciones
            </NavLink>
          )}
        </nav>
      </aside>
      <div>
        <header className="shell__header">
          <div className="row">
            <strong>{user?.name}</strong>
            <Badge>{user?.role}</Badge>
            <span className="muted">Inactividad: 5 min cierra sesión</span>
          </div>
          <Button variant="ghost" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
