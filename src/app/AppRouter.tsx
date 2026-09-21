import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute, RoleGate } from '../components/auth/ProtectedRoute'
import { LoginPage } from '../pages/login/LoginPage'
import { AdminAssessmentsPage } from '../pages/admin/AdminAssessmentsPage'
import { AdminAssessmentEditorPage } from '../pages/admin/AdminAssessmentEditorPage'
import { AdminSubmissionsPage } from '../pages/admin/AdminSubmissionsPage'
import { AdminSecurityPage } from '../pages/admin/AdminSecurityPage'
import { CandidateCatalogPage } from '../pages/candidate/CandidateCatalogPage'
import { CandidateDetailPage } from '../pages/candidate/CandidateDetailPage'
import { CandidateAttemptPage } from '../pages/candidate/CandidateAttemptPage'
import { CandidateResultPage } from '../pages/candidate/CandidateResultPage'
import { SESSION_ENDED_EVENT } from '../lib/constants'
import { UserRole } from '../types/models'

function SessionEndedListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const onEnded = () => navigate('/login', { replace: true })
    window.addEventListener(SESSION_ENDED_EVENT, onEnded)
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded)
  }, [navigate])
  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionEndedListener />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/assessments"
            element={
              <RoleGate role={UserRole.Admin}>
                <AdminAssessmentsPage />
              </RoleGate>
            }
          />
          <Route
            path="/admin/assessments/:id/submissions"
            element={
              <RoleGate role={UserRole.Admin}>
                <AdminSubmissionsPage />
              </RoleGate>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <RoleGate role={UserRole.Admin}>
                <AdminSubmissionsPage />
              </RoleGate>
            }
          />
          <Route
            path="/admin/security"
            element={
              <RoleGate role={UserRole.Admin}>
                <AdminSecurityPage />
              </RoleGate>
            }
          />
          <Route
            path="/admin/assessments/:id"
            element={
              <RoleGate role={UserRole.Admin}>
                <AdminAssessmentEditorPage />
              </RoleGate>
            }
          />
          <Route
            path="/candidate/assessments"
            element={
              <RoleGate role={UserRole.Candidate}>
                <CandidateCatalogPage />
              </RoleGate>
            }
          />
          <Route
            path="/candidate/assessments/:id"
            element={
              <RoleGate role={UserRole.Candidate}>
                <CandidateDetailPage />
              </RoleGate>
            }
          />
          <Route
            path="/candidate/assessments/:id/attempt"
            element={
              <RoleGate role={UserRole.Candidate}>
                <CandidateAttemptPage />
              </RoleGate>
            }
          />
          <Route
            path="/candidate/results/:id"
            element={
              <RoleGate role={UserRole.Candidate}>
                <CandidateResultPage />
              </RoleGate>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
