import { describe, expect, it } from 'vitest'
import { decodePayload, encodePayload, isEncodedEnvelope } from './codec'

describe('payloadCodec', () => {
  it('roundtrip encodes and decodes UTF-8 JSON', () => {
    const original = { message: 'evaluación técnica', nested: { ok: true } }
    const encoded = encodePayload(original)
    expect(isEncodedEnvelope(encoded)).toBe(true)
    expect(encoded.payload).not.toContain('evaluación')
    expect(decodePayload(encoded)).toEqual(original)
  })

  it('rejects bodies without envelope', () => {
    expect(() => decodePayload({ foo: 1 })).toThrow(/envelope/)
  })
})
