import { useEffect } from 'react'
import { IDLE_TIMEOUT_MS } from '../lib/constants'
import { startIdleWatch } from '../lib/idle-session'
import { useAuth } from './useAuth'

export function useIdleLogout() {
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }
    return startIdleWatch(IDLE_TIMEOUT_MS, () => {
      void logout()
    })
  }, [isAuthenticated, logout])
}
