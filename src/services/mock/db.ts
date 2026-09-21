import { ProgrammingLanguage, UserRole, type Assessment, type Question, type Submission, type User } from '../../types/models'

export const demoUsers: Array<User & { password: string }> = [
  {
    id: 'usr-admin',
    email: 'admin@kata.com',
    name: 'Ana Admin',
    role: UserRole.Admin,
    password: 'Admin123!',
  },
  {
    id: 'usr-candidate',
    email: 'candidate@kata.com',
    name: 'Carlos Candidato',
    role: UserRole.Candidate,
    password: 'Candidato123!',
  },
]

const now = () => new Date().toISOString()

export const assessments: Assessment[] = [
  {
    id: 'asmt-java-intro',
    name: 'Java — sumar enteros',
    description: 'Implementa una función que reciba dos enteros y retorne la suma.',
    timeLimitMinutes: 30,
    questionCount: 1,
    language: ProgrammingLanguage.Java,
    createdAt: now(),
  },
  {
    id: 'asmt-js-fizz',
    name: 'JavaScript — FizzBuzz',
    description: 'Dado n, retorna Fizz, Buzz, FizzBuzz o el número.',
    timeLimitMinutes: 25,
    questionCount: 1,
    language: ProgrammingLanguage.JavaScript,
    createdAt: now(),
  },
  {
    id: 'asmt-py-pal',
    name: 'Python — palíndromo',
    description: 'Determina si una cadena es palíndromo ignorando mayúsculas.',
    timeLimitMinutes: 20,
    questionCount: 1,
    language: ProgrammingLanguage.Python,
    createdAt: now(),
  },
]

export const questions: Question[] = [
  {
    id: 'q-java-sum',
    assessmentId: 'asmt-java-intro',
    title: 'Suma',
    description: 'public int sum(int a, int b)',
    language: ProgrammingLanguage.Java,
    starterCode: 'public int sum(int a, int b) {\n  return 0;\n}\n',
    testCases: [
      { id: 't1', input: '1 2', expected: '3', points: 50 },
      { id: 't2', input: '-1 1', expected: '0', points: 50 },
    ],
  },
  {
    id: 'q-js-fizz',
    assessmentId: 'asmt-js-fizz',
    title: 'FizzBuzz',
    description: 'function fizzBuzz(n)',
    language: ProgrammingLanguage.JavaScript,
    starterCode: 'function fizzBuzz(n) {\n  return String(n);\n}\n',
    testCases: [
      { id: 't1', input: '3', expected: 'Fizz', points: 40 },
      { id: 't2', input: '5', expected: 'Buzz', points: 40 },
      { id: 't3', input: '15', expected: 'FizzBuzz', points: 20 },
    ],
  },
  {
    id: 'q-py-pal',
    assessmentId: 'asmt-py-pal',
    title: 'Palíndromo',
    description: 'def is_palindrome(text: str) -> bool',
    language: ProgrammingLanguage.Python,
    starterCode: 'def is_palindrome(text: str) -> bool:\n    return False\n',
    testCases: [
      { id: 't1', input: 'Ana', expected: 'True', points: 50 },
      { id: 't2', input: 'Kata', expected: 'False', points: 50 },
    ],
  },
]

export const sessions = new Map<string, { userId: string; expiresAt: number }>()
export const submissions: Submission[] = []

export function syncQuestionCount(assessmentId: string) {
  const assessment = assessments.find((item) => item.id === assessmentId)
  if (assessment) {
    assessment.questionCount = questions.filter((item) => item.assessmentId === assessmentId).length
  }
}
