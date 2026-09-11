import {
  Activity,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'

type HealthResponse = {
  status: string
  service: string
  version: string
  timestamp: string
}

type RequestState = 'loading' | 'success' | 'error'

const configuredServices = [
  {
    name: 'FastAPI ML Service',
    description: 'XGBoost, Isolation Forest and hybrid-risk inference',
    state: 'Configured',
    icon: Activity,
  },
  {
    name: 'PostgreSQL',
    description: 'SOC events, alerts, incidents and threat intelligence',
    state: 'Configured',
    icon: Database,
  },
]

export function SystemHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [requestState, setRequestState] = useState<RequestState>('loading')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkBackend = useCallback(async () => {
    setRequestState('loading')

    try {
      const response = await fetch('/api/health', {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Health service returned HTTP ${response.status}`)
      }

      const result = (await response.json()) as HealthResponse
      setHealth(result)
      setLastChecked(new Date())
      setRequestState('success')
    } catch {
      setHealth(null)
      setLastChecked(new Date())
      setRequestState('error')
    }
  }, [])

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      void checkBackend()
    }, 0)

    return () => window.clearTimeout(initialCheck)
  }, [checkBackend])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform operations"
        title="System Health"
        description="Monitor application availability and the configured detection architecture."
        actions={
          <Button
            variant="secondary"
            onClick={() => void checkBackend()}
            disabled={requestState === 'loading'}
          >
            <RefreshCw
              className={requestState === 'loading' ? 'animate-spin' : ''}
              size={16}
            />
            Refresh status
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="soc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Overall state
          </p>
          <div className="mt-4 flex items-center gap-3">
            {requestState === 'success' ? (
              <CheckCircle2 className="text-success" size={26} />
            ) : (
              <TriangleAlert className="text-warning" size={26} />
            )}
            <strong className="text-xl text-heading">
              {requestState === 'success' ? 'Operational' : 'Attention'}
            </strong>
          </div>
        </article>

        <article className="soc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            API checks
          </p>
          <p className="mt-4 text-3xl font-bold text-heading">1</p>
          <p className="mt-1 text-sm text-muted">Live service boundary</p>
        </article>

        <article className="soc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Configured services
          </p>
          <p className="mt-4 text-3xl font-bold text-heading">3</p>
          <p className="mt-1 text-sm text-muted">API, ML and persistence</p>
        </article>

        <article className="soc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Last checked
          </p>
          <p className="mt-4 font-mono text-sm font-semibold text-heading">
            {lastChecked
              ? lastChecked.toLocaleTimeString()
              : 'Waiting...'}
          </p>
          <p className="mt-1 text-sm text-muted">Local browser time</p>
        </article>
      </section>

      {requestState === 'loading' && (
        <section className="soc-card space-y-4 p-6">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </section>
      )}

      {requestState === 'error' && (
        <ErrorState
          title="ASP.NET Core API is unavailable"
          description="Start the backend on port 5080 and retry this health check. The dashboard itself is still working."
          onRetry={() => void checkBackend()}
        />
      )}

      {requestState === 'success' && health && (
        <section className="soc-card overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-success/10 p-2 text-success">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-heading">Live service status</h2>
                <p className="text-sm text-muted">
                  Verified through the real backend health endpoint
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Server className="text-accent" size={21} />
                <div>
                  <p className="font-semibold text-heading">{health.service}</p>
                  <p className="text-sm text-muted">
                    ASP.NET Core API · Version {health.version}
                  </p>
                </div>
              </div>
              <Badge variant="success">{health.status}</Badge>
            </div>

            {configuredServices.map((service) => {
              const Icon = service.icon

              return (
                <div
                  key={service.name}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-accent" size={21} />
                    <div>
                      <p className="font-semibold text-heading">{service.name}</p>
                      <p className="text-sm text-muted">{service.description}</p>
                    </div>
                  </div>
                  <Badge variant="neutral">{service.state}</Badge>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <aside className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-muted">
        <strong className="text-heading">Honest portfolio boundary:</strong>{' '}
        “Configured” means that integration exists in the architecture. Only the
        ASP.NET health result above is checked live by this page.
      </aside>
    </div>
  )
}
