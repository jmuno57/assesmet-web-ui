import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Badge, Card, Spinner } from '../../components/ui/Feedback'
import { readErrorMessage } from '../../lib/http'
import { probeService } from '../../services/api'
import type { ProbeDefinition, ProbeReport, ProbeSuite, SandboxRuntimeInfo } from '../../types/models'

function ProbePreview({ probe, report }: { probe: ProbeDefinition; report?: ProbeReport }) {
  return (
    <Card>
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>{probe.title}</h3>
          {report ? <Badge tone={report.passed ? 'ok' : 'err'}>{report.passed ? 'cumple' : 'falla'}</Badge> : <Badge>pendiente</Badge>}
        </div>
        <p className="muted">{probe.requirement}</p>
        <p>{probe.why}</p>
        <p className="muted">Job que se publica en la cola (mismo contrato que POST /executions):</p>
        <pre className="console">{JSON.stringify(probe.payload, null, 2)}</pre>
        <p className="muted">Código fuente del candidato simulado:</p>
        <pre className="console">{probe.payload.source}</pre>
        {report ? <p>{report.evidence}</p> : null}
      </div>
    </Card>
  )
}

export function AdminSecurityPage() {
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [probes, setProbes] = useState<ProbeDefinition[]>([])
  const [runtime, setRuntime] = useState<SandboxRuntimeInfo | null>(null)
  const [suite, setSuite] = useState<ProbeSuite | null>(null)

  useEffect(() => {
    void probeService
      .catalog()
      .then((data) => {
        setProbes(data.probes)
        setRuntime(data.runtime)
      })
      .catch((cause) => setError(readErrorMessage(cause, 'No se pudo cargar la previsualización')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="stack">
      <div>
        <h1>Demostración de ejecución segura</h1>
        <p className="muted">
          Abajo está el código exacto que se envía al sandbox. Al correr, usa la misma cola que un candidato: el API no
          ejecuta ese source, lo publica y espera el JSON del hijo.
        </p>
      </div>
      {runtime ? (
        <Card>
          <div className="stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3>CPU y RAM del sandbox</h3>
              <Badge>{runtime.mode}</Badge>
            </div>
            <p>
              Docker aplica cgroups al contenedor: CPU {runtime.cpus}, RAM {runtime.memory}, {runtime.pidsLimit} PIDs,
              red {runtime.network}, timeout {runtime.timeoutMs} ms. El proceso Node del API no es quien limita; lo hace
              el runtime (docker run / task de Fargate).
            </p>
            <p className="muted">Comando equivalente al que lanza el worker:</p>
            <pre className="console">{['docker', ...runtime.args].join(' ')}</pre>
          </div>
        </Card>
      ) : null}
      <Button
        disabled={busy || loading}
        onClick={() => {
          setBusy(true)
          setError(null)
          void probeService
            .runAll()
            .then(setSuite)
            .catch((cause) => setError(readErrorMessage(cause, 'No se pudo correr la demostración')))
            .finally(() => setBusy(false))
        }}
      >
        Correr demostración
      </Button>
      {loading || busy ? <Spinner /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {suite ? (
        <Badge tone={suite.passed ? 'ok' : 'err'}>
          {suite.passed ? 'La plataforma resistió las cargas' : 'Alguna prueba no se cumplió'}
        </Badge>
      ) : null}
      {probes.map((probe) => (
        <ProbePreview key={probe.id} probe={probe} report={suite?.reports.find((item) => item.id === probe.id)} />
      ))}
    </div>
  )
}
