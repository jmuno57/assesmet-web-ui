import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AUTH_STORAGE_KEY, SESSION_ENDED_EVENT } from '../lib/constants'
import type { Session, User } from '../types/models'

type AuthState = {
  token: string | null
  user: User | null
  setSession: (session: Session) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (session) => set({ token: session.accessToken, user: session.user }),
      clearSession: () => {
        set({ token: null, user: null })
        sessionStorage.removeItem(AUTH_STORAGE_KEY)
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

export function emitSessionEnded() {
  window.dispatchEvent(new Event(SESSION_ENDED_EVENT))
}

export function isAuthenticated(): boolean {
  return Boolean(useAuthStore.getState().token)
}
