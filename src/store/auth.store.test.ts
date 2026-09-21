import { beforeEach, describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY } from '../lib/constants'
import { useAuthStore } from './auth.store'
import { UserRole } from '../types/models'

describe('auth store', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useAuthStore.setState({ token: null, user: null })
  })

  it('persists the session in sessionStorage and clears it on logout', () => {
    useAuthStore.getState().setSession({
      accessToken: 'token.jwt',
      user: { id: '1', email: 'a@a.com', name: 'A', role: UserRole.Admin },
    })
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toContain('token.jwt')
    useAuthStore.getState().clearSession()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
