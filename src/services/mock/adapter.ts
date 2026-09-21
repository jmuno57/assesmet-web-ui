import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { decodePayload, encodePayload, isEncodedEnvelope } from '../../lib/codec'
import { createAccessToken, isTokenExpired, readTokenPayload } from '../../lib/jwt'
import { assessments, demoUsers, questions, sessions, submissions, syncQuestionCount } from './db'
import { UserRole, type Assessment, type ExecutionResult, type Question, type Submission } from '../../types/models'

class MockHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function delay(ms = 180) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readBody<T>(config: InternalAxiosRequestConfig): T | undefined {
  if (config.data === undefined || config.data === null || config.data === '') {
    return undefined
  }
  const raw = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
  return isEncodedEnvelope(raw) ? decodePayload<T>(raw) : (raw as T)
}

function pathOf(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? ''
  const withoutQuery = url.split('?')[0] ?? url
  return withoutQuery.replace(/^\/api/, '') || '/'
}

function authorize(config: InternalAxiosRequestConfig): { userId: string; role: string } {
  const header = String(config.headers?.Authorization ?? config.headers?.authorization ?? '')
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) {
    throw new MockHttpError(401, 'Sesión no encontrada')
  }
  const session = sessions.get(token)
  if (!session || session.expiresAt <= Date.now() || isTokenExpired(token)) {
    sessions.delete(token)
    throw new MockHttpError(401, 'Sesión inactiva o expirada')
  }
  const payload = readTokenPayload(token)
  if (!payload) {
    throw new MockHttpError(401, 'Token inválido')
  }
  return { userId: payload.sub, role: payload.role }
}

function requireRole(role: string, expected: string) {
  if (role !== expected) {
    throw new MockHttpError(403, 'No autorizado para este recurso')
  }
}

function match(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split('/').filter(Boolean)
  const patternParts = pattern.split('/').filter(Boolean)
  if (pathParts.length !== patternParts.length) {
    return null
  }
  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i += 1) {
    const expected = patternParts[i] ?? ''
    const actual = pathParts[i] ?? ''
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = actual
      continue
    }
    if (expected !== actual) {
      return null
    }
  }
  return params
}

function handle(config: InternalAxiosRequestConfig): unknown {
  const method = (config.method ?? 'get').toUpperCase()
  const path = pathOf(config)

  if (method === 'POST' && path === '/auth/login') {
    const body = readBody<{ email: string; password: string }>(config)
    const found = demoUsers.find(
      (user) => user.email === body?.email.trim() && user.password === body.password,
    )
    if (!found) {
      throw new MockHttpError(401, 'Correo o contraseña inválidos')
    }
    const user = { id: found.id, email: found.email, name: found.name, role: found.role }
    const accessToken = createAccessToken(user)
    sessions.set(accessToken, { userId: user.id, expiresAt: Date.now() + 60 * 60 * 1000 })
    return { accessToken, user }
  }

  const auth = authorize(config)

  if (method === 'POST' && path === '/auth/logout') {
    const header = String(config.headers?.Authorization ?? '')
    const token = header.replace(/^Bearer\s+/i, '')
    sessions.delete(token)
    return { ok: true }
  }

  if (method === 'GET' && path === '/assessments') {
    return [...assessments]
  }

  if (method === 'POST' && path === '/assessments') {
    requireRole(auth.role, UserRole.Admin)
    const body = readBody<Omit<Assessment, 'id' | 'createdAt' | 'questionCount'>>(config)
    if (!body) {
      throw new MockHttpError(400, 'Cuerpo requerido')
    }
    const created: Assessment = {
      ...body,
      id: `asmt-${crypto.randomUUID()}`,
      questionCount: 0,
      createdAt: new Date().toISOString(),
    }
    assessments.unshift(created)
    return created
  }

  const assessmentMatch = match(path, '/assessments/:id')
  if (assessmentMatch && method === 'GET') {
    const found = assessments.find((item) => item.id === assessmentMatch.id)
    if (!found) {
      throw new MockHttpError(404, 'Assessment no encontrado')
    }
    return found
  }
  if (assessmentMatch && method === 'PUT') {
    requireRole(auth.role, UserRole.Admin)
    const found = assessments.find((item) => item.id === assessmentMatch.id)
    if (!found) {
      throw new MockHttpError(404, 'Assessment no encontrado')
    }
    Object.assign(found, readBody(config) ?? {})
    return found
  }

  const questionsMatch = match(path, '/assessments/:id/questions')
  if (questionsMatch && method === 'GET') {
    return questions.filter((item) => item.assessmentId === questionsMatch.id)
  }
  if (questionsMatch && method === 'POST') {
    requireRole(auth.role, UserRole.Admin)
    const body = readBody<Omit<Question, 'id' | 'assessmentId'>>(config)
    if (!body) {
      throw new MockHttpError(400, 'Cuerpo requerido')
    }
    const created: Question = {
      ...body,
      id: `q-${crypto.randomUUID()}`,
      assessmentId: questionsMatch.id ?? '',
      testCases: (body.testCases ?? []).map((testCase, index) => ({
        ...testCase,
        id: `t-${index}-${crypto.randomUUID()}`,
      })),
    }
    questions.push(created)
    syncQuestionCount(created.assessmentId)
    return created
  }

  const questionItemMatch = match(path, '/assessments/:id/questions/:questionId')
  if (questionItemMatch && method === 'PUT') {
    requireRole(auth.role, UserRole.Admin)
    const found = questions.find((item) => item.id === questionItemMatch.questionId)
    if (!found || found.assessmentId !== questionItemMatch.id) {
      throw new MockHttpError(404, 'Pregunta no encontrada')
    }
    Object.assign(found, readBody(config) ?? {})
    return found
  }
  if (questionItemMatch && method === 'DELETE') {
    requireRole(auth.role, UserRole.Admin)
    const index = questions.findIndex((item) => item.id === questionItemMatch.questionId)
    const found = index >= 0 ? questions[index] : undefined
    if (!found || found.assessmentId !== questionItemMatch.id) {
      throw new MockHttpError(404, 'Pregunta no encontrada')
    }
    questions.splice(index, 1)
    syncQuestionCount(found.assessmentId)
    return { ok: true }
  }

  if (method === 'POST' && path === '/executions') {
    const body = readBody<{ source: string; language: string; tests: Array<{ input: string; expected: string }> }>(
      config,
    )
    if (!body) {
      throw new MockHttpError(400, 'Cuerpo requerido')
    }
    if (body.source.includes('while(true)') || body.source.includes('while True')) {
      const timeout: ExecutionResult = {
        stdout: '',
        stderr: 'Timeout: la ejecución superó 5 s',
        passed: 0,
        failed: body.tests.length,
        timedOut: true,
        verdict: 'timeout',
        cases: [],
        diagnostics: [{ kind: 'timeout', message: 'Timeout: la ejecución superó 5 s' }],
      }
      return timeout
    }
    const passed = body.tests.filter((test) => body.source.includes(test.expected)).length
    const result: ExecutionResult = {
      stdout: passed === body.tests.length ? 'OK\n' : 'FAIL\n',
      stderr: '',
      passed,
      failed: body.tests.length - passed,
      timedOut: false,
      verdict: passed === body.tests.length ? 'passed' : 'failed',
      cases: body.tests.map((test, index) => {
        const ok = body.source.includes(test.expected)
        return {
          index: index + 1,
          input: test.input,
          expected: test.expected,
          actual: ok ? test.expected : '',
          passed: ok,
          timedOut: false,
          reason: ok
            ? 'Caso correcto'
            : `Caso ${index + 1}: se esperaba "${test.expected}" y se obtuvo "(vacío)". Entrada: "${test.input}".`,
        }
      }),
      diagnostics: [],
    }
    return result
  }

  if (method === 'POST' && path === '/submissions') {
    const body = readBody<{
      assessmentId: string
      timeSpentSeconds?: number
      answers: Array<{ questionId: string; source: string; language?: string }>
    }>(config)
    if (!body) {
      throw new MockHttpError(400, 'Cuerpo requerido')
    }
    const related = questions.filter((item) => item.assessmentId === body.assessmentId)
    const results: ExecutionResult[] = related.map((question) => {
      const answer = body.answers.find((item) => item.questionId === question.id)
      const source = answer?.source ?? ''
      const passed = question.testCases.filter((test) => source.includes(test.expected)).length
      return {
        stdout: `${passed}/${question.testCases.length} tests`,
        stderr: '',
        passed,
        failed: question.testCases.length - passed,
        timedOut: false,
        verdict: passed === question.testCases.length ? 'passed' : 'failed',
        cases: question.testCases.map((test, index) => {
          const ok = source.includes(test.expected)
          return {
            index: index + 1,
            input: test.input,
            expected: test.expected,
            actual: ok ? test.expected : '',
            passed: ok,
            timedOut: false,
            reason: ok ? 'Caso correcto' : `Caso ${index + 1}: se esperaba "${test.expected}".`,
          }
        }),
        diagnostics: [],
      }
    })
    const maxScore = related.reduce(
      (sum, question) => sum + question.testCases.reduce((inner, test) => inner + test.points, 0),
      0,
    )
    const score = related.reduce((sum, question, index) => {
      const result = results[index]
      if (!result || result.passed === 0) {
        return sum
      }
      const ratio = result.passed / question.testCases.length
      const questionPoints = question.testCases.reduce((inner, test) => inner + test.points, 0)
      return sum + Math.round(questionPoints * ratio)
    }, 0)
    const user = demoUsers.find((item) => item.id === auth.userId)
    const assessment = assessments.find((item) => item.id === body.assessmentId)
    const submission: Submission = {
      id: `sub-${crypto.randomUUID()}`,
      assessmentId: body.assessmentId,
      assessmentName: assessment?.name,
      userId: auth.userId,
      userName: user?.name,
      userEmail: user?.email,
      score,
      maxScore,
      timeSpentSeconds: body.timeSpentSeconds,
      createdAt: new Date().toISOString(),
      results,
    }
    submissions.unshift(submission)
    return submission
  }

  const mySubmissionsMatch = match(path, '/assessments/:id/my-submissions')
  if (mySubmissionsMatch && method === 'GET') {
    return submissions.filter((item) => item.assessmentId === mySubmissionsMatch.id && item.userId === auth.userId)
  }

  if (method === 'GET' && path === '/submissions') {
    requireRole(auth.role, UserRole.Admin)
    return [...submissions]
  }

  const submissionsMatch = match(path, '/assessments/:id/submissions')
  if (submissionsMatch && method === 'GET') {
    requireRole(auth.role, UserRole.Admin)
    return submissions.filter((item) => item.assessmentId === submissionsMatch.id)
  }

  if (method === 'GET' && path === '/security-probes') {
    requireRole(auth.role, UserRole.Admin)
    return {
      runtime: {
        mode: 'process',
        timeoutMs: 5000,
        memory: '512m',
        cpus: '0.5',
        pidsLimit: 64,
        network: 'none',
        args: ['docker', 'run', '--rm', '-i', '--network', 'none', '--memory', '512m', '--cpus', '0.5', 'kata-sandbox:local'],
      },
      probes: [
        {
          id: 'isolation-timeout',
          requirement: 'Aislamiento · prevención de ejecución maliciosa · control de recursos',
          title: 'Una carga que no termina no tumba el API y se corta a 5 s',
          why: 'El job que viaja por la cola es JavaScript con un bucle infinito.',
          payload: { language: 'javascript', source: 'for (;;) {}', tests: [{ input: '1', expected: 'ok', points: 1 }] },
        },
        {
          id: 'no-secrets',
          requirement: 'Restricciones de acceso · manejo seguro de entradas',
          title: 'El sandbox no recibe secretos ni credenciales',
          why: 'El job pide las claves de process.env.',
          payload: {
            language: 'javascript',
            source: 'process.stdout.write(JSON.stringify(Object.keys(process.env)));\nprocess.exit(0);',
            tests: [{ input: '1', expected: 'ok', points: 1 }],
          },
        },
      ],
    }
  }

  if (method === 'POST' && path === '/security-probes') {
    requireRole(auth.role, UserRole.Admin)
    return {
      passed: true,
      reports: [
        {
          id: 'isolation-timeout',
          requirement: 'Aislamiento · prevención de ejecución maliciosa · control de recursos',
          title: 'Una carga que no termina no tumba el API y se corta a 5 s',
          why: 'El job que viaja por la cola es JavaScript con un bucle infinito.',
          payload: { language: 'javascript', source: 'for (;;) {}', tests: [{ input: '1', expected: 'ok', points: 1 }] },
          passed: true,
          evidence: 'Mock: el sandbox cortaría la carga y el API seguiría vivo.',
        },
        {
          id: 'no-secrets',
          requirement: 'Restricciones de acceso · manejo seguro de entradas',
          title: 'El sandbox no recibe secretos ni credenciales',
          why: 'El job pide las claves de process.env.',
          payload: {
            language: 'javascript',
            source: 'process.stdout.write(JSON.stringify(Object.keys(process.env)));\nprocess.exit(0);',
            tests: [{ input: '1', expected: 'ok', points: 1 }],
          },
          passed: true,
          evidence: 'Mock: JWT_SECRET no viaja al proceso de ejecución.',
        },
      ],
    }
  }

  throw new MockHttpError(404, `Ruta mock no implementada: ${method} ${path}`)
}

function asResponse(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse {
  return {
    data: encodePayload(data),
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: { 'content-type': 'application/json', 'x-payload-encoding': 'base64' },
    config,
  }
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay()
  try {
    const data = handle(config)
    return asResponse(config, 200, data)
  } catch (error) {
    const status = error instanceof MockHttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Error interno'
    const response = asResponse(config, status, { message })
    return Promise.reject(new AxiosError(message, String(status), config, undefined, response))
  }
}
