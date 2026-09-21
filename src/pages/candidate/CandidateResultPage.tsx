import { useLocation, useNavigate } from 'react-router-dom'
import { ScorePanel } from '../../components/score/ScorePanel'
import { Button } from '../../components/ui/Button'
import type { Submission } from '../../types/models'

export function CandidateResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const submission = (location.state as { submission?: Submission } | null)?.submission

  if (!submission) {
    return (
      <div className="stack">
        <p className="muted">No hay un resultado en memoria. Vuelve a resolver un assessment.</p>
        <Button onClick={() => navigate('/candidate/assessments')}>Ir al catálogo</Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <ScorePanel submission={submission} />
      <Button variant="ghost" onClick={() => navigate('/candidate/assessments')}>
        Volver
      </Button>
    </div>
  )
}
