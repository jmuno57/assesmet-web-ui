import type { CaseResult, ExecutionResult } from '../../types/models'
import { Badge } from '../ui/Feedback'

function toneOf(result: ExecutionResult) {
  return result.verdict === 'passed' ? 'ok' : result.verdict === 'timeout' ? 'warn' : 'err'
}

function CaseRow({ item }: { item: CaseResult }) {
  return (
    <li className={`case-result${item.passed ? ' is-ok' : ' is-err'}`}>
      <strong>Caso {item.index}</strong>
      {item.passed ? (
        <span>correcto</span>
      ) : (
        <span>
          {item.reason}
          {item.line ? ` (línea ${item.line})` : ''}
        </span>
      )}
      {item.passed ? null : (
        <dl>
          <div>
            <dt>Entrada</dt>
            <dd>{item.input || '(vacía)'}</dd>
          </div>
          <div>
            <dt>Esperado</dt>
            <dd>{item.expected}</dd>
          </div>
          <div>
            <dt>Obtenido</dt>
            <dd>{item.actual || '(vacío)'}</dd>
          </div>
        </dl>
      )}
    </li>
  )
}

export function ConsoleOutput({ result }: { result: ExecutionResult | null }) {
  if (!result) {
    return <pre className="console muted">Sin ejecución.</pre>
  }
  const cases = result.cases ?? []
  const diagnostics = result.diagnostics ?? []
  return (
    <div className="stack">
      <Badge tone={toneOf(result)}>{result.verdict}</Badge>
      {diagnostics
        .filter((item) => item.kind === 'compile' || item.kind === 'runtime' || item.kind === 'timeout')
        .map((item, index) => (
          <p key={`${item.kind}-${index}`} className="error-text">
            {item.line ? `Línea ${item.line}: ${item.message}` : item.message}
          </p>
        ))}
      {cases.length > 0 ? (
        <ul className="case-list">
          {cases.map((item) => (
            <CaseRow key={`${item.index}-${item.input}`} item={item} />
          ))}
        </ul>
      ) : (
        <pre className="console">{result.stdout || result.stderr}</pre>
      )}
    </div>
  )
}
