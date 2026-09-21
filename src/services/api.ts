import { http } from '../lib/http'
import type { Assessment, AssessmentPayload, ExecutionPayload, ExecutionResult, LoginPayload, ProbeDefinition, ProbeSuite, Question, QuestionPayload, SandboxRuntimeInfo, Session, SubmitPayload, Submission } from '../types/models'

export const authService = {
  login: (payload: LoginPayload) => http.post<Session>('/auth/login', payload).then((res) => res.data),
  logout: () => http.post<{ ok: boolean }>('/auth/logout', {}).then((res) => res.data),
}

export const assessmentService = {
  list: () => http.get<Assessment[]>('/assessments').then((res) => res.data),
  getById: (id: string) => http.get<Assessment>(`/assessments/${id}`).then((res) => res.data),
  create: (payload: AssessmentPayload) => http.post<Assessment>('/assessments', payload).then((res) => res.data),
  update: (id: string, payload: AssessmentPayload) =>
    http.put<Assessment>(`/assessments/${id}`, payload).then((res) => res.data),
}

export const questionService = {
  listByAssessment: (assessmentId: string) =>
    http.get<Question[]>(`/assessments/${assessmentId}/questions`).then((res) => res.data),
  create: (assessmentId: string, payload: QuestionPayload) =>
    http.post<Question>(`/assessments/${assessmentId}/questions`, payload).then((res) => res.data),
  update: (assessmentId: string, questionId: string, payload: QuestionPayload) =>
    http.put<Question>(`/assessments/${assessmentId}/questions/${questionId}`, payload).then((res) => res.data),
  remove: (assessmentId: string, questionId: string) =>
    http.delete<{ ok: boolean }>(`/assessments/${assessmentId}/questions/${questionId}`).then((res) => res.data),
}

export const executionService = {
  run: (payload: ExecutionPayload) => http.post<ExecutionResult>('/executions', payload).then((res) => res.data),
}

export const submissionService = {
  submit: (payload: SubmitPayload) => http.post<Submission>('/submissions', payload).then((res) => res.data),
  list: () => http.get<Submission[]>('/submissions').then((res) => res.data),
  listByAssessment: (assessmentId: string) =>
    http.get<Submission[]>(`/assessments/${assessmentId}/submissions`).then((res) => res.data),
  listMine: (assessmentId: string) =>
    http.get<Submission[]>(`/assessments/${assessmentId}/my-submissions`).then((res) => res.data),
}

export const probeService = {
  catalog: () => http.get<{ probes: ProbeDefinition[]; runtime: SandboxRuntimeInfo }>('/security-probes').then((res) => res.data),
  runAll: () => http.post<ProbeSuite>('/security-probes', {}).then((res) => res.data),
}
