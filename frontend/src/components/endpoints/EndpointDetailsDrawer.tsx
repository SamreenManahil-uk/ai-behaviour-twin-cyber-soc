import {
  Activity,
  Clock3,
  Cpu,
  Network,
  Power,
  ShieldOff,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import type { DemoEndpoint } from '../../data/demoOperations'
import { useToast } from '../../hooks/useToast'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Drawer } from '../ui/Drawer'

interface EndpointDetailsDrawerProps {
  endpoint: DemoEndpoint | null
  onClose: () => void
}

function statusVariant(status: DemoEndpoint['status']) {
  if (status === 'Healthy') {
    return 'success' as const
  }

  if (status === 'At Risk') {
    return 'warning' as const
  }

  if (status === 'Critical') {
    return 'danger' as const
  }

  if (status === 'Isolated') {
    return 'purple' as const
  }

  return 'neutral' as const
}

export function EndpointDetailsDrawer({
  endpoint,
  onClose,
}: EndpointDetailsDrawerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { showToast } = useToast()

  if (!endpoint) {
    return null
  }

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={endpoint.hostname}
        description={`${endpoint.id} · ${endpoint.operatingSystem}`}
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="danger"
              leftIcon={<ShieldOff size={16} />}
              onClick={() => setConfirmOpen(true)}
            >
              Simulate isolation
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusVariant(endpoint.status)} dot>
              {endpoint.status}
            </Badge>
            <Badge variant="info">{endpoint.operatingSystem}</Badge>
            <Badge variant="purple">Behaviour profile active</Badge>
          </div>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="soc-label">Endpoint risk</p>
                <p
                  className={[
                    'technical-value mt-2 text-4xl font-bold',
                    endpoint.riskScore >= 85
                      ? 'text-critical'
                      : endpoint.riskScore >= 60
                        ? 'text-medium'
                        : 'text-healthy',
                  ].join(' ')}
                >
                  {endpoint.riskScore}
                  <span className="text-sm text-[var(--foreground-muted)]">
                    /100
                  </span>
                </p>
              </div>
              <Activity className="text-brand-400" size={26} />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-solid)]">
              <div
                className={[
                  'h-full rounded-full',
                  endpoint.riskScore >= 85
                    ? 'bg-critical'
                    : endpoint.riskScore >= 60
                      ? 'bg-medium'
                      : 'bg-healthy',
                ].join(' ')}
                style={{ width: `${endpoint.riskScore}%` }}
              />
            </div>
          </section>

          <section>
            <p className="soc-label mb-3">Asset details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [Network, 'IP address', endpoint.ipAddress],
                [UserRound, 'Owner', endpoint.owner],
                [Clock3, 'Last seen', endpoint.lastSeen],
                [Cpu, 'Agent', endpoint.agentVersion],
              ].map(([Icon, label, value]) => {
                const DetailIcon = Icon as typeof Network

                return (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                  >
                    <DetailIcon size={16} className="text-brand-400" />
                    <p className="soc-label mt-3 !text-[0.55rem]">
                      {String(label)}
                    </p>
                    <p className="technical-value mt-1.5 text-xs font-semibold">
                      {String(value)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="soc-label">Behaviour Twin profile</p>
              <span className="technical-value text-xs text-[var(--foreground-muted)]">
                {endpoint.behaviourProfile.historySamples} samples
              </span>
            </div>

            <div className="space-y-3 rounded-2xl border border-brand-400/15 bg-brand-400/5 p-5">
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[var(--foreground-muted)]">
                  Normal login window
                </span>
                <span className="technical-value text-xs font-semibold">
                  {endpoint.behaviourProfile.normalLoginWindow}
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs text-[var(--foreground-muted)]">
                  Usual processes
                </p>
                <div className="flex flex-wrap gap-2">
                  {endpoint.behaviourProfile.usualProcesses.map((process) => (
                    <Badge key={process}>{process}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-[var(--foreground-muted)]">
                  Usual destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {endpoint.behaviourProfile.usualDestinations.map((ip) => (
                    <Badge key={ip} variant="info">
                      {ip}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-4 border-t border-brand-400/10 pt-3">
                <span className="text-xs text-[var(--foreground-muted)]">
                  Current deviation
                </span>
                <span className="technical-value text-xs font-bold text-brand-400">
                  {endpoint.behaviourProfile.deviation.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-medium/15 bg-medium/5 p-4">
            <div className="flex gap-3">
              <Power className="shrink-0 text-medium" size={19} />
              <p className="text-xs leading-5 text-[var(--foreground-secondary)]">
                Endpoint response controls are portfolio simulations. They do
                not connect to or modify a real device.
              </p>
            </div>
          </section>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          showToast({
            title: 'Endpoint isolation simulated',
            description: `${endpoint.hostname} was not modified. This is a demonstration record only.`,
            variant: 'warning',
          })
        }}
        title={`Simulate isolation for ${endpoint.hostname}?`}
        description="This creates UI feedback only. It will not disconnect, block or change any real computer."
        confirmLabel="Simulate isolation"
      />
    </>
  )
}
