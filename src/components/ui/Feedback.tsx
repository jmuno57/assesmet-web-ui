import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'ok' | 'warn' | 'err'
}) {
  const suffix = tone === 'default' ? '' : ` badge--${tone}`
  return <span className={`badge${suffix}`}>{children}</span>
}

export function Spinner() {
  return <div className="spinner" aria-label="Cargando" />
}
