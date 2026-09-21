export const UserRole = {
  Admin: 'admin',
  Candidate: 'candidate',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
}

export type Session = {
  accessToken: string
  user: User
}

export type Assessment = {
  id: string
  name: string
  description: string
  timeLimitMinutes: number
  questionCount: number
  language: ProgrammingLanguage
  createdAt: string
}

export const ProgrammingLanguage = {
  Java: 'java',
  JavaScript: 'javascript',
  Python: 'python',
} as const

export type ProgrammingLanguage = (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage]

export type TestCase = {
  id: string
  input: string
  expected: string
  points: number
}

export type Question = {
  id: string
  assessmentId: string
  title: string
  description: string
  language: ProgrammingLanguage
  starterCode: string
  testCases: TestCase[]
}

export type Diagnostic = {
  line?: number
  message: string
  kind: 'compile' | 'runtime' | 'timeout' | 'assertion'
}

export type CaseResult = {
  index: number
  input: string
  expected: string
  actual: string
  passed: boolean
  timedOut: boolean
  reason: string
  line?: number
}

export type ExecutionResult = {
  stdout: string
  stderr: string
  passed: number
  failed: number
  timedOut: boolean
  verdict: 'passed' | 'failed' | 'timeout'
  cases?: CaseResult[]
  diagnostics?: Diagnostic[]
}

export type Submission = {
  id: string
  assessmentId: string
  assessmentName?: string
  userId: string
  userName?: string
  userEmail?: string
  score: number
  maxScore: number
  timeSpentSeconds?: number
  createdAt: string
  results: ExecutionResult[]
}

export type LoginPayload = {
  email: string
  password: string
}

export type AssessmentPayload = {
  name: string
  description: string
  timeLimitMinutes: number
  language: ProgrammingLanguage
}

export type QuestionPayload = {
  title: string
  description: string
  language: ProgrammingLanguage
  starterCode: string
  testCases: Omit<TestCase, 'id'>[]
}

export type ExecutionPayload = {
  source: string
  language: ProgrammingLanguage
  tests: Omit<TestCase, 'id'>[]
}

export type SubmitPayload = {
  assessmentId: string
  timeSpentSeconds?: number
  answers: Array<{ questionId: string; source: string; language?: ProgrammingLanguage }>
}

export type SandboxRuntimeInfo = {
  mode: string
  timeoutMs: number
  memory: string
  cpus: string
  pidsLimit: number
  network: string
  args: string[]
}

export type ProbePayload = {
  language: string
  source: string
  tests: Array<{ input: string; expected: string; points: number }>
}

export type ProbeDefinition = {
  id: string
  requirement: string
  title: string
  why: string
  payload: ProbePayload
}

export type ProbeReport = ProbeDefinition & {
  passed: boolean
  evidence: string
}

export type ProbeSuite = {
  passed: boolean
  reports: ProbeReport[]
}
