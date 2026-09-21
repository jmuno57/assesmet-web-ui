import { Link, useParams } from 'react-router-dom'
import { ScorePanel } from '../../components/score/ScorePanel'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Feedback'
import { useAssessment } from '../../hooks/useAssessments'
import { useSubmissions } from '../../hooks/useSubmissions'

function formatWhen(value: string) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function AdminSubmissionsPage() {
  const { id } = useParams()
  const scoped = Boolean(id)
  const { assessment } = useAssessment(scoped ? id : undefined)
  const { items, loading, error } = useSubmissions(id)

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>{scoped ? 'Resultados del assessment' : 'Resultados'}</h1>
          <p className="muted">
            {scoped
              ? assessment?.name ?? 'Histórico de envíos de esta prueba'
              : 'Quién presentó cada evaluación y qué puntaje obtuvo'}
          </p>
        </div>
        {scoped ? (
          <Link to="/admin/submissions">
            <Button variant="ghost">Ver todo</Button>
          </Link>
        ) : null}
      </div>
      {loading ? <Spinner /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && items.length === 0 ? (
        <p className="muted">Aún no hay envíos{scoped ? ' para esta prueba' : ''}.</p>
      ) : null}
      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Correo</th>
              {scoped ? null : <th>Assessment</th>}
              <th>Puntaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.userName ?? item.userId}</td>
                <td>{item.userEmail ?? '—'}</td>
                {scoped ? null : <td>{item.assessmentName ?? item.assessmentId}</td>}
                <td>
                  {item.score} / {item.maxScore}
                </td>
                <td>{formatWhen(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.map((item) => (
        <ScorePanel key={`${item.id}-detail`} submission={item} />
      ))}
    </div>
  )
}
