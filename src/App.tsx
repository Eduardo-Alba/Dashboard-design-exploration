import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'

const LandingPage = lazy(() => import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage })))
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { BudgetsPage } from '@/features/budgets/BudgetsPage'
import { AlertsPage } from '@/features/alerts/AlertsPage'
import { ReceivablesPage } from '@/features/accounts/ReceivablesPage'
import { PayablesPage } from '@/features/accounts/PayablesPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { UsersPage } from '@/features/users/UsersPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => init(), [init])

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={null}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN', 'CONTADOR']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/transacciones" element={<TransactionsPage />} />
          <Route
            path="/presupuestos"
            element={
              <ProtectedRoute roles={['ADMIN', 'CONTADOR']}>
                <BudgetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alertas"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cuentas-por-cobrar"
            element={
              <ProtectedRoute roles={['ADMIN', 'CONTADOR']}>
                <ReceivablesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cuentas-por-pagar"
            element={
              <ProtectedRoute roles={['ADMIN', 'CONTADOR']}>
                <PayablesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute roles={['ADMIN', 'CONTADOR']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/configuracion" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
