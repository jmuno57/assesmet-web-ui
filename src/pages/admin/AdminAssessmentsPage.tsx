import { Link } from 'react-router-dom'
import { AssessmentCard } from '../../components/assessment/AssessmentCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Feedback'
import { useAssessments } from '../../hooks/useAssessments'

export function AdminAssessmentsPage() {
  const { items, loading, error } = useAssessments()

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>Assessments</h1>
          <p className="muted">Gestión de evaluaciones</p>
        </div>
        <Link to="/admin/assessments/new">
          <Button>Crear assessment</Button>
        </Link>
      </div>
      {loading ? <Spinner /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="grid-cards">
        {items.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            actionLabel="Editar / preguntas"
            to={`/admin/assessments/${assessment.id}`}
            secondaryLabel="Resultados"
            secondaryTo={`/admin/assessments/${assessment.id}/submissions`}
          />
        ))}
      </div>
    </div>
  )
}
