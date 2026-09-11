import {
  BellRing,
  CheckCircle2,
  Crosshair,
  Network,
  TerminalSquare,
  UserRound,
} from 'lucide-react'
import type { DemoAlert } from '../../data/demoEventsAlerts'
import { useToast } from '../../hooks/useToast'
import { SimulatedSoarPanel } from './SimulatedSoarPanel'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { SeverityBadge } from '../ui/SeverityBadge'

interface AlertDetailsDrawerProps {
  alert: DemoAlert | null
  onClose: () => void
}

function statusVariant(status: DemoAlert['status']) {
  if (status === 'Contained' || status === 'Resolved') {
    return 'success' as const
  }

  if (status === 'Investigating') {
    return 'warning' as const
  }

  if (status === 'False Positive') {
    return 'neutral' as const
  }

  return 'danger' as const
}

export function AlertDetailsDrawer({
  alert,
  onClose,
}: AlertDetailsDrawerProps) {
  const { showToast } = useToast()

  if (!alert) {
    return null
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={alert.title}
      description={`${alert.id} · ${alert.timestamp}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            leftIcon={<BellRing size={16} />}
            onClick={() =>
              showToast({
                title: 'Incident workflow opened',
                description: `${alert.id} is ready to attach to an incident.`,
                variant: 'success',
              })
            }
          >
            Create incident
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity={alert.severity} />
          <Badge variant={statusVariant(alert.status)} dot>
            {alert.status}
          </Badge>
          <Badge variant="purple">{alert.detectionSource}</Badge>
        </div>

        <section className="rounded-2xl border border-critical/15 bg-critical/5 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="soc-label">Hybrid risk score</p>
              <p className="technical-value mt-2 text-4xl font-bold text-critical">
                {alert.riskScore}
                <span className="text-sm text-[var(--foreground-muted)]">
                  /100
                </span>
              </p>
            </div>
            <Crosshair className="text-critical" size={27} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--foreground-secondary)]">
            {alert.description}
          </p>
        </section>

        <section>
          <p className="soc-label mb-3">Investigation context</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [TerminalSquare, 'Process', alert.process],
              [UserRound, 'User', alert.user],
              [Network, 'Destination', alert.destinationIp],
              [Crosshair, 'MITRE technique', `${alert.mitreId} ${alert.mitreName}`],
            ].map(([Icon, label, value]) => {
              const DetailIcon = Icon as typeof TerminalSquare

              return (
                <div
                  key={String(label)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <DetailIcon
                    size={16}
                    className="mb-3 text-brand-400"
                  />
                  <p className="soc-label !text-[0.55rem]">{String(label)}</p>
                  <p className="technical-value mt-1.5 break-all text-xs font-semibold">
                    {String(value)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <p className="soc-label mb-3">Detection signal contribution</p>
          <div className="space-y-4">
            {[
              ['XGBoost supervised', alert.signals.xgboost, 'bg-brand-400'],
              ['Isolation Forest', alert.signals.anomaly, 'bg-violet-400'],
              ['Behaviour Twin', alert.signals.behaviour, 'bg-fuchsia-400'],
              ['Behaviour rules', alert.signals.rules, 'bg-high'],
            ].map(([label, value, colour]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground-secondary)]">
                    {label}
                  </span>
                  <span className="technical-value text-xs font-semibold">
                    {value}/100
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={`h-full rounded-full ${colour}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="soc-label mb-3">Explainable evidence</p>
          <div className="space-y-2">
            {alert.evidence.map((evidence) => (
              <div
                key={evidence}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
              >
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-medium"
                />
                <p className="text-sm leading-5 text-[var(--foreground-secondary)]">
                  {evidence}
                </p>
              </div>
            ))}
          </div>
        </section>

        <SimulatedSoarPanel
          key={alert.id}
          alert={alert}
        />
      </div>
    </Drawer>
  )
}
