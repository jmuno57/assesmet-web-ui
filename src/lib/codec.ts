export type EncodedEnvelope = {
  payload: string
}

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function fromBase64(encoded: string): string {
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function isEncodedEnvelope(value: unknown): value is EncodedEnvelope {
  if (!value || typeof value !== 'object') {
    return false
  }
  return typeof (value as EncodedEnvelope).payload === 'string'
}

export function encodePayload(value: unknown): EncodedEnvelope {
  return { payload: toBase64(JSON.stringify(value)) }
}

export function decodePayload<T>(value: unknown): T {
  if (!isEncodedEnvelope(value)) {
    throw new Error('El cuerpo no usa envelope Base64')
  }
  return JSON.parse(fromBase64(value.payload)) as T
}

export function unwrapTransport<T>(value: unknown): T {
  return isEncodedEnvelope(value) ? decodePayload<T>(value) : (value as T)
}
