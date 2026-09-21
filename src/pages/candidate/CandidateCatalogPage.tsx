import { AssessmentCard } from '../../components/assessment/AssessmentCard'
import { Spinner } from '../../components/ui/Feedback'
import { useAssessments } from '../../hooks/useAssessments'

export function CandidateCatalogPage() {
  const { items, loading, error } = useAssessments()

  return (
    <div className="stack">
      <h1>Evaluaciones disponibles</h1>
      <p className="muted">Elige un assessment para resolverlo en el editor.</p>
      {loading ? <Spinner /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="grid-cards">
        {items.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            actionLabel="Ver evaluación"
            to={`/candidate/assessments/${assessment.id}`}
          />
        ))}
      </div>
    </div>
  )
}
