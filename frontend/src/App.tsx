import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { RouteLoader } from './components/ui/RouteLoader'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ToastProvider } from './providers/ToastProvider'

const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((module) => ({
    default: module.OverviewPage,
  })),
)

const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((module) => ({
    default: module.EventsPage,
  })),
)

const AlertsPage = lazy(() =>
  import('./pages/AlertsPage').then((module) => ({
    default: module.AlertsPage,
  })),
)

const IncidentsPage = lazy(() =>
  import('./pages/IncidentsPage').then((module) => ({
    default: module.IncidentsPage,
  })),
)

const EndpointsPage = lazy(() =>
  import('./pages/EndpointsPage').then((module) => ({
    default: module.EndpointsPage,
  })),
)

const ThreatsPage = lazy(() =>
  import('./pages/ThreatsPage').then((module) => ({
    default: module.ThreatsPage,
  })),
)

const MitreAttackPage = lazy(() =>
  import('./pages/MitreAttackPage').then((module) => ({
    default: module.MitreAttackPage,
  })),
)

const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
)

const SystemHealthPage = lazy(() =>
  import('./pages/SystemHealthPage').then((module) => ({
    default: module.SystemHealthPage,
  })),
)

const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)

const UiKitPage = lazy(() =>
  import('./pages/UiKitPage').then((module) => ({
    default: module.UiKitPage,
  })),
)

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="incidents" element={<IncidentsPage />} />
                    <Route path="endpoints" element={<EndpointsPage />} />
                    <Route path="threats" element={<ThreatsPage />} />
                    <Route path="mitre-attack" element={<MitreAttackPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="system-health" element={<SystemHealthPage />} />
                    <Route path="ui-kit" element={<UiKitPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
