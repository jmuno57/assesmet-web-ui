import type { Submission } from '../../types/models'
import { Badge, Card } from '../ui/Feedback'
import { ConsoleOutput } from '../console/ConsoleOutput'

function formatSpent(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function ScorePanel({ submission }: { submission: Submission }) {
  return (
    <Card>
      <div className="stack">
        <h2>Calificación</h2>
        <Badge tone={submission.score === submission.maxScore ? 'ok' : 'err'}>
          {submission.score} / {submission.maxScore}
        </Badge>
        {submission.userName ? (
          <p className="muted">
            {submission.userName} · {submission.userEmail}
          </p>
        ) : null}
        {typeof submission.timeSpentSeconds === 'number' ? (
          <p className="muted">Tiempo consumido: {formatSpent(submission.timeSpentSeconds)}</p>
        ) : null}
        {submission.results.map((result, index) => (
          <div key={`${result.verdict}-${index}`} className="stack">
            <p className="muted">
              Pregunta {index + 1}: {result.passed} passed · {result.failed} failed · {result.verdict}
            </p>
            <ConsoleOutput result={result} />
          </div>
        ))}
      </div>
    </Card>
  )
}
