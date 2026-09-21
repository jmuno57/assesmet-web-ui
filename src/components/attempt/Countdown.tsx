import { Badge } from '../ui/Feedback'

type CountdownProps = {
  label: string
  remainingMs: number
  started: boolean
}

export function Countdown({ label, remainingMs, started }: CountdownProps) {
  const tone = !started ? 'default' : remainingMs <= 30_000 ? 'err' : remainingMs <= 60_000 ? 'warn' : 'ok'
  return (
    <div className={`countdown${remainingMs <= 60_000 && started ? ' is-warn' : ''}${remainingMs <= 30_000 && started ? ' is-err' : ''}`}>
      <span className="muted">{started ? 'Tiempo restante' : 'Tiempo límite'}</span>
      <strong>{label}</strong>
      <Badge tone={tone}>{started ? (remainingMs <= 0 ? 'agotado' : 'en curso') : 'sin iniciar'}</Badge>
    </div>
  )
}
