import { fromBase64, toBase64 } from './codec'
import type { User } from '../types/models'

type JwtPayload = {
  sub: string
  email: string
  role: User['role']
  name: string
  exp: number
  iat: number
}

function encodeSegment(value: object): string {
  return toBase64(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export function createAccessToken(user: User, ttlSeconds = 60 * 60): string {
  const now = Math.floor(Date.now() / 1000)
  const header = encodeSegment({ alg: 'HS256', typ: 'JWT' })
  const payload = encodeSegment({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + ttlSeconds,
  } satisfies JwtPayload)
  return `${header}.${payload}.mock-signature`
}

export function readTokenPayload(token: string): JwtPayload | null {
  const [, payload] = token.split('.')
  if (!payload) {
    return null
  }
  try {
    const padded = payload.replaceAll('-', '+').replaceAll('_', '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    return JSON.parse(fromBase64(padded + pad)) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = readTokenPayload(token)
  if (!payload) {
    return true
  }
  return payload.exp * 1000 <= Date.now()
}
