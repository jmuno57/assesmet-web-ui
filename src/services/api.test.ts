import { describe, expect, it } from 'vitest'
import { encodePayload, isEncodedEnvelope } from '../lib/codec'
import { authService } from './api'
import { useAuthStore } from '../store/auth.store'

describe('http interceptors', () => {
  it('sends JWT and returns a decoded session from a Base64 envelope', async () => {
    useAuthStore.setState({ token: null, user: null })
    const session = await authService.login({ email: 'admin@kata.com', password: 'Admin123!' })
    expect(session.user.role).toBe('admin')
    expect(session.accessToken.split('.')).toHaveLength(3)
    const envelope = encodePayload({ ping: true })
    expect(isEncodedEnvelope(envelope)).toBe(true)
  })

  it('rejects invalid credentials', async () => {
    await expect(authService.login({ email: 'x@x.com', password: 'bad' })).rejects.toThrow()
  })
})
