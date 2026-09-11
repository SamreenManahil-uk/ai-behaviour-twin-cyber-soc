import {
  Ban,
  ClipboardList,
  Database,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldOff,
  Skull,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import type { DemoAlert } from '../../data/demoEventsAlerts'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getApiErrorMessage } from '../../services/apiClient'
import {
  createSimulatedResponseAction,
  getSimulatedResponseActions,
  type SimulatedActionType,
  type SimulatedResponseAction,
} from '../../services/soarService'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface SimulatedSoarPanelProps {
  alert: DemoAlert
}

interface ActionDefinition {
  type: SimulatedActionType
  label: string
  description: string
  icon: LucideIcon
  target: (alert: DemoAlert) => string | undefined
}

const actions: ActionDefinition[] = [
  {
    type: 'isolateEndpoint',
    label: 'Isolate endpoint',
    description: 'Record that endpoint isolation would be requested.',
    icon: ShieldOff,
    target: () => undefined,
  },
  {
    type: 'blockIpAddress',
    label: 'Block IP address',
    description: 'Record that the destination IP would be blocked.',
    icon: Ban,
    target: (alert) => alert.destinationIp,
  },
  {
    type: 'terminateProcess',
    label: 'Terminate process',
    description: 'Record that the suspicious process would be terminated.',
    icon: Skull,
    target: (alert) => alert.process,
  },
  {
    type: 'disableAccount',
    label: 'Disable account',
    description: 'Record that the associated account would be disabled.',
    icon: UserRound,
    target: (alert) => alert.user,
  },
  {
    type: 'collectForensics',
    label: 'Collect forensics',
    description: 'Record that forensic evidence collection would be requested.',
    icon: Search,
    target: () => undefined,
  },
]

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function actionLabel(type: SimulatedActionType) {
  return (
    actions.find((action) => action.type === type)?.label ??
    'Simulated response'
  )
}

function createDemoAuditRecord(
  alert: DemoAlert,
  userId: string,
  action: ActionDefinition,
  reason: string,
  sequence: number,
): SimulatedResponseAction {
  const target = action.target(alert) ?? alert.endpoint
  const timestamp = new Date().toISOString()

  return {
    id: `DEMO-AUDIT-${sequence}`,
    alertId: alert.id,
    endpointId: alert.endpoint,
    requestedByUserId: userId,
    actionType: action.type,
    target,
    reason,
    status: 'simulatedCompleted',
    resultSummary: `SIMULATION ONLY: ${action.label} would be requested for '${target}'. No real system was changed.`,
    isSimulation: true,
    requestedAtUtc: timestamp,
    completedAtUtc: timestamp,
  }
}

export function SimulatedSoarPanel({
  alert,
}: SimulatedSoarPanelProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [pendingAction, setPendingAction] =
    useState<ActionDefinition | null>(null)
  const [reason, setReason] = useState('')
  const [history, setHistory] = useState<
    SimulatedResponseAction[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const isAdmin = user?.role === 'Admin'
  const isDemoUser = user?.id.startsWith('demo-') ?? false
  const hasPersistedAlertId = uuidPattern.test(alert.id)
  const canUseBackend =
    isAdmin && !isDemoUser && hasPersistedAlertId

  function openConfirmation(action: ActionDefinition) {
    if (!isAdmin) {
      showToast({
        title: 'Administrator permission required',
        description:
          'SOC Analysts may review response history, but simulated action creation is AdminOnly.',
        variant: 'warning',
      })
      return
    }

    if (!isDemoUser && !hasPersistedAlertId) {
      showToast({
        title: 'Demo alert is not persisted',
        description:
          'Sign in with Demo Admin to preview this workflow, or use a real UUID-backed alert from the API.',
        variant: 'warning',
      })
      return
    }

    setInlineError(null)
    setReason('')
    setPendingAction(action)
  }

  function closeConfirmation() {
    if (isSubmitting) {
      return
    }

    setPendingAction(null)
    setReason('')
    setInlineError(null)
  }

  async function submitSimulation() {
    if (!pendingAction || !user) {
      return
    }

    const normalizedReason = reason.trim()

    if (normalizedReason.length < 10) {
      setInlineError(
        'Provide at least 10 characters explaining why this response is being simulated.',
      )
      return
    }

    setIsSubmitting(true)
    setInlineError(null)

    try {
      let record: SimulatedResponseAction

      if (isDemoUser) {
        record = createDemoAuditRecord(
          alert,
          user.id,
          pendingAction,
          normalizedReason,
          history.length + 1,
        )
      } else {
        record = await createSimulatedResponseAction(alert.id, {
          actionType: pendingAction.type,
          target: pendingAction.target(alert),
          reason: normalizedReason,
        })
      }

      setHistory((current) => [record, ...current])
      setPendingAction(null)
      setReason('')

      showToast({
        title: `${actionLabel(record.actionType)} simulated`,
        description: isDemoUser
          ? 'Browser-only demo audit created. It was not persisted to PostgreSQL.'
          : 'Immutable simulation audit saved by the ASP.NET API.',
        variant: 'success',
      })
    } catch (error) {
      setInlineError(
        getApiErrorMessage(
          error,
          'The simulated response could not be recorded.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function refreshHistory() {
    if (!canUseBackend) {
      return
    }

    setIsRefreshing(true)
    setInlineError(null)

    try {
      const records = await getSimulatedResponseActions(alert.id)
      setHistory(records)
    } catch (error) {
      setInlineError(
        getApiErrorMessage(
          error,
          'The response audit history could not be loaded.',
        ),
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="soc-label">
              Simulated SOAR response
            </p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Audit-only workflow. No real endpoint action can occur.
            </p>
          </div>

          <Badge variant={isDemoUser ? 'warning' : 'purple'}>
            {isDemoUser ? 'Browser-only demo' : 'API audit mode'}
          </Badge>
        </div>

        <div className="rounded-2xl border border-medium/20 bg-medium/5 p-4">
          <div className="flex gap-3">
            <FlaskConical
              size={19}
              className="mt-0.5 shrink-0 text-medium"
            />
            <div>
              <p className="text-sm font-semibold">
                Simulation safety boundary
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-secondary)]">
                These controls only demonstrate authorization,
                confirmation and audit recording. They cannot isolate a
                device, block an IP, stop a process, disable an account
                or collect real forensic data.
              </p>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <p className="mt-3 rounded-xl border border-high/20 bg-high/5 p-3 text-xs leading-5 text-high">
            Your SOC Analyst role can review this area, but action
            creation requires the Admin role and would return HTTP 403.
          </p>
        )}

        {isAdmin && !isDemoUser && !hasPersistedAlertId && (
          <p className="mt-3 rounded-xl border border-high/20 bg-high/5 p-3 text-xs leading-5 text-high">
            This is a fictional dashboard alert, not a PostgreSQL UUID
            record. Backend persistence is therefore disabled for this
            item. Use Demo Admin to preview the browser-only workflow.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            const disabled =
              !isAdmin ||
              (!isDemoUser && !hasPersistedAlertId)

            return (
              <Button
                key={action.type}
                variant="outline"
                leftIcon={<Icon size={16} />}
                disabled={disabled}
                onClick={() => openConfirmation(action)}
              >
                {action.label}
              </Button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="soc-label">
              Response audit history
            </p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Append-only records for this alert.
            </p>
          </div>

          {canUseBackend && (
            <Button
              variant="ghost"
              size="sm"
              loading={isRefreshing}
              leftIcon={<RefreshCw size={14} />}
              onClick={() => void refreshHistory()}
            >
              Refresh history
            </Button>
          )}
        </div>

        {inlineError && !pendingAction && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-critical/20 bg-critical/5 p-3 text-xs leading-5 text-critical"
          >
            {inlineError}
          </p>
        )}

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-center">
            <ClipboardList
              size={23}
              className="mx-auto text-[var(--foreground-muted)]"
            />
            <p className="mt-3 text-sm font-semibold">
              No simulated responses recorded
            </p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Confirmed simulations will appear here. No real action
              history is implied.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {actionLabel(record.actionType)}
                    </p>
                    <p className="technical-value mt-1 text-[0.625rem] text-brand-400">
                      {record.target}
                    </p>
                  </div>
                  <Badge variant="success">
                    Simulated only
                  </Badge>
                </div>

                <p className="mt-3 text-xs leading-5 text-[var(--foreground-secondary)]">
                  {record.reason}
                </p>

                <p className="mt-2 text-[0.6875rem] leading-5 text-[var(--foreground-muted)]">
                  {record.resultSummary}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[0.625rem] text-[var(--foreground-muted)]">
                  <Database size={12} />
                  {isDemoUser
                    ? 'Browser memory only'
                    : new Date(record.requestedAtUtc).toLocaleString()}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={pendingAction !== null}
        onClose={closeConfirmation}
        title={`Confirm ${pendingAction?.label ?? 'simulation'}`}
        description="This creates an audit record only. No real response action will execute."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={closeConfirmation}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isSubmitting}
              disabled={reason.trim().length < 10}
              onClick={() => void submitSimulation()}
            >
              Record simulation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-medium/20 bg-medium/5 p-4">
            <p className="soc-label">Selected action</p>
            <p className="mt-2 text-sm font-semibold">
              {pendingAction?.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--foreground-secondary)]">
              {pendingAction?.description}
            </p>
          </div>

          <div>
            <label
              htmlFor="soar-reason"
              className="mb-2 block text-xs font-semibold"
            >
              Investigation reason
            </label>
            <textarea
              id="soar-reason"
              value={reason}
              maxLength={1000}
              rows={4}
              placeholder="Explain why this simulated response is appropriate..."
              onChange={(event) => {
                setReason(event.target.value)
                setInlineError(null)
              }}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--foreground-muted)] focus:border-brand-400"
            />
            <div className="mt-2 flex justify-between gap-3">
              <p className="text-[0.6875rem] text-[var(--foreground-muted)]">
                Minimum 10 characters
              </p>
              <p className="technical-value text-[0.6875rem] text-[var(--foreground-muted)]">
                {reason.length}/1000
              </p>
            </div>
          </div>

          {inlineError && (
            <p
              role="alert"
              className="rounded-xl border border-critical/20 bg-critical/5 p-3 text-xs leading-5 text-critical"
            >
              {inlineError}
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}
