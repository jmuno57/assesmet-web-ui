import { Link } from 'react-router-dom'
import type { Assessment } from '../../types/models'
import { Badge } from '../ui/Feedback'
import { Button } from '../ui/Button'

type AssessmentCardProps = {
  assessment: Assessment
  actionLabel: string
  to: string
  secondaryLabel?: string
  secondaryTo?: string
}

export function AssessmentCard({ assessment, actionLabel, to, secondaryLabel, secondaryTo }: AssessmentCardProps) {
  return (
    <article className="card stack">
      <div className="row">
        <h3>{assessment.name}</h3>
        <Badge>{assessment.language}</Badge>
      </div>
      <p className="muted">{assessment.description}</p>
      <div className="row muted">
        <span>{assessment.questionCount} preguntas</span>
        <span>{assessment.timeLimitMinutes} min</span>
      </div>
      <div className="row">
        <Link to={to}>
          <Button>{actionLabel}</Button>
        </Link>
        {secondaryLabel && secondaryTo ? (
          <Link to={secondaryTo}>
            <Button variant="ghost">{secondaryLabel}</Button>
          </Link>
        ) : null}
      </div>
    </article>
  )
}
