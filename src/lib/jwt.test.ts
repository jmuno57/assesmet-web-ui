import { describe, expect, it } from 'vitest'
import { createAccessToken, isTokenExpired, readTokenPayload } from './jwt'
import { UserRole } from '../types/models'

describe('jwt mock', () => {
  it('creates a readable access token', () => {
    const token = createAccessToken({
      id: 'usr-1',
      email: 'admin@kata.com',
      name: 'Ana',
      role: UserRole.Admin,
    })
    const payload = readTokenPayload(token)
    expect(payload?.email).toBe('admin@kata.com')
    expect(payload?.role).toBe('admin')
    expect(isTokenExpired(token)).toBe(false)
  })
})
