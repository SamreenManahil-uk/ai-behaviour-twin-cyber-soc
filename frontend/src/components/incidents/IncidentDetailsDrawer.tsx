import {
  BellRing,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { DemoIncident } from '../../data/demoOperations'
import { useToast } from '../../hooks/useToast'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { SeverityBadge } from '../ui/SeverityBadge'

interface IncidentDetailsDrawerProps {
  incident: DemoIncident | null
  onClose: () => void
}

function statusVariant(status: DemoIncident['status']) {
  if (status === 'Resolved' || status === 'Closed') {
    return 'success' as const
  }

  if (status === 'Contained') {
    return 'info' as const
  }

  if (status === 'Investigating') {
    return 'warning' as const
  }

  return 'danger' as const
}

export function IncidentDetailsDrawer({
  incident,
  onClose,
}: IncidentDetailsDrawerProps) {
  const { showToast } = useToast()

  if (!incident) {
    return null
  }

  const resolved =
    incident.status === 'Resolved' || incident.status === 'Closed'

  return (
    <Drawer
      open
      onClose={onClose}
      title={incident.title}
      description={`${incident.id} · Updated ${incident.updatedAt}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            leftIcon={
              resolved ? <RotateCcw size={16} /> : <ShieldCheck size={16} />
            }
            onClick={() =>
              showToast({
                title: resolved
                  ? 'Incident reopen requested'
                  : 'Incident resolution requested',
                description:
                  'Demo state only. Real API integration will persist this workflow.',
                variant: 'success',
              })
            }
          >
            {resolved ? 'Reopen incident' : 'Resolve incident'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <SeverityBadge severity={incident.severity} />
          <Badge variant={statusVariant(incident.status)} dot>
            {incident.status}
          </Badge>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <p className="text-sm leading-6 text-[var(--foreground-secondary)]">
            {incident.description}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Alerts', String(incident.alertCount)],
              ['Endpoints', String(incident.endpointCount)],
              ['Owner', incident.analyst],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-[var(--surface-solid)] p-3 text-center"
              >
                <p className="technical-value truncate text-sm font-bold">
                  {value}
                </p>
                <p className="mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <BellRing size={17} className="text-brand-400" />
            <p className="soc-label">Related alerts</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {incident.alertIds.map((alertId) => (
              <Badge key={alertId} variant="purple">
                {alertId}
              </Badge>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={17} className="text-brand-400" />
            <p className="soc-label">Investigation timeline</p>
          </div>

          <div className="relative space-y-5">
            <div className="absolute bottom-2 left-[0.4375rem] top-2 w-px bg-[var(--border)]" />

            {incident.timeline.map((item) => (
              <div key={`${item.title}-${item.time}`} className="relative flex gap-4">
                <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-[var(--background-elevated)] bg-brand-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="technical-value text-[0.625rem] text-[var(--foreground-muted)]">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="shrink-0 text-healthy" size={19} />
            <div>
              <p className="text-sm font-semibold">Audit-ready workflow</p>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                Status, assignment and resolution timestamps will be persisted
                server-side by the ASP.NET incident service.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4">
          <UserRound className="text-brand-400" size={20} />
          <div>
            <p className="text-sm font-semibold">{incident.analyst}</p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Assigned incident analyst
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
