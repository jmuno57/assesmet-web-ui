import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { encodePayload, isEncodedEnvelope, unwrapTransport } from './codec'
import { API_BASE_URL } from './constants'
import { emitSessionEnded, useAuthStore } from '../store/auth.store'
import { mockAdapter } from '../services/mock/adapter'

function applyAuthHeader(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
}

function encodeBody(config: InternalAxiosRequestConfig) {
  if (config.data === undefined || config.data === null || config.data instanceof FormData) {
    return config
  }
  if (isEncodedEnvelope(config.data)) {
    return config
  }
  config.data = encodePayload(config.data)
  config.headers.set('Content-Type', 'application/json')
  config.headers.set('X-Payload-Encoding', 'base64')
  return config
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25_000,
  ...(import.meta.env.MODE === 'test' ? { adapter: mockAdapter } : {}),
})

http.interceptors.request.use((config) => encodeBody(applyAuthHeader(config)))

http.interceptors.response.use(
  (response) => {
    response.data = unwrapTransport(response.data)
    return response
  },
  (error: AxiosError) => {
    if (error.response?.data) {
      try {
        error.response.data = unwrapTransport(error.response.data)
      } catch {
        // el error crudo se conserva si no viene envelope
      }
    }
    const status = error.response?.status
    const url = error.config?.url ?? ''
    if (status === 401 && !url.includes('/auth/login')) {
      useAuthStore.getState().clearSession()
      emitSessionEnded()
    }
    return Promise.reject(error)
  },
)

export function readErrorMessage(error: unknown, fallback = 'No se pudo completar la solicitud'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
