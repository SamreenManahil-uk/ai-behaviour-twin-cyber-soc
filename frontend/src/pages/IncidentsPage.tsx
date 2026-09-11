import {
  BellRing,
  FilterX,
  Plus,
  SearchX,
  UserRound,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { IncidentDetailsDrawer } from '../components/incidents/IncidentDetailsDrawer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import {
  demoIncidents,
  type DemoIncident,
} from '../data/demoOperations'
import { useToast } from '../hooks/useToast'

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

export function IncidentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [selectedIncident, setSelectedIncident] =
    useState<DemoIncident | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [newSeverity, setNewSeverity] = useState('High')
  const [titleError, setTitleError] = useState('')
  const { showToast } = useToast()

  const filteredIncidents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return demoIncidents.filter((incident) => {
      const matchesSearch =
        !term ||
        [
          incident.id,
          incident.title,
          incident.description,
          incident.analyst,
        ].some((value) => value.toLowerCase().includes(term))

      return (
        matchesSearch &&
        (status === 'All' || incident.status === status) &&
        (severity === 'All' || incident.severity === severity)
      )
    })
  }, [search, status, severity])

  function clearFilters() {
    setSearch('')
    setStatus('All')
    setSeverity('All')
  }

  function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (title.trim().length < 5) {
      setTitleError('Incident title must contain at least 5 characters.')
      return
    }

    setTitleError('')
    setCreateOpen(false)
    showToast({
      title: 'Incident draft validated',
      description:
        'The real API will persist this form during the integration step.',
      variant: 'success',
    })
    setTitle('')
    setNewSeverity('High')
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Investigation and response"
        title="Incident Management"
        description="Coordinate alert ownership, investigation, containment and resolution through an auditable workflow."
        badge={<Badge variant="purple">Demo incidents</Badge>}
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            Create incident
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active incidents', '4', 'text-critical'],
          ['Investigating', '2', 'text-medium'],
          ['Contained', '1', 'text-low'],
          ['Resolved today', '8', 'text-healthy'],
        ].map(([label, value, colour]) => (
          <article key={label} className="soc-panel p-4">
            <p className="soc-label">{label}</p>
            <p className={`technical-value mt-3 text-2xl font-bold ${colour}`}>
              {value}
            </p>
          </article>
        ))}
      </div>

      <article className="soc-panel p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search incident, analyst or description..."
            label="Search incidents"
          />
          <Select
            label="Filter incident status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { label: 'All statuses', value: 'All' },
              { label: 'Open', value: 'Open' },
              { label: 'Investigating', value: 'Investigating' },
              { label: 'Contained', value: 'Contained' },
              { label: 'Resolved', value: 'Resolved' },
              { label: 'Closed', value: 'Closed' },
            ]}
          />
          <Select
            label="Filter incident severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            options={[
              { label: 'All severities', value: 'All' },
              { label: 'Critical', value: 'Critical' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
            ]}
          />
          <Button
            variant="outline"
            leftIcon={<FilterX size={16} />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>
      </article>

      {filteredIncidents.length === 0 ? (
        <EmptyState
          title="No incidents found"
          description="No incidents match your search and filters."
          icon={SearchX}
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredIncidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => setSelectedIncident(incident)}
              className="soc-panel-interactive p-5 text-left sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={incident.severity} />
                  <Badge variant={statusVariant(incident.status)} dot>
                    {incident.status}
                  </Badge>
                </div>
                <span className="technical-value text-[0.6875rem] text-[var(--foreground-muted)]">
                  {incident.id}
                </span>
              </div>

              <h3 className="soc-value mt-5 text-lg">{incident.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                {incident.description}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
                <div>
                  <p className="soc-label !text-[0.52rem]">Alerts</p>
                  <p className="technical-value mt-1 text-sm font-bold">
                    {incident.alertCount}
                  </p>
                </div>
                <div>
                  <p className="soc-label !text-[0.52rem]">Endpoints</p>
                  <p className="technical-value mt-1 text-sm font-bold">
                    {incident.endpointCount}
                  </p>
                </div>
                <div>
                  <p className="soc-label !text-[0.52rem]">Updated</p>
                  <p className="mt-1 truncate text-xs font-semibold">
                    {incident.updatedAt}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                <UserRound size={14} />
                {incident.analyst}
              </div>
            </button>
          ))}
        </div>
      )}

      <IncidentDetailsDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          setTitleError('')
        }}
        title="Create security incident"
        description="Create an investigation case for related security alerts."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-incident-form">
              Create draft
            </Button>
          </>
        }
      >
        <form
          id="create-incident-form"
          onSubmit={submitIncident}
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Incident title
            </span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (titleError) {
                  setTitleError('')
                }
              }}
              maxLength={160}
              placeholder="Example: Possible endpoint compromise"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-brand-400/50"
              aria-invalid={Boolean(titleError)}
            />
            {titleError && (
              <span className="mt-2 block text-xs text-critical">
                {titleError}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Severity</span>
            <Select
              label="Select severity"
              value={newSeverity}
              onChange={(event) => setNewSeverity(event.target.value)}
              className="w-full"
              options={[
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
              ]}
            />
          </label>

          <div className="rounded-xl border border-brand-400/15 bg-brand-400/5 p-4">
            <div className="flex gap-3">
              <BellRing className="shrink-0 text-brand-400" size={18} />
              <p className="text-xs leading-5 text-[var(--foreground-secondary)]">
                Alert selection and transactional API persistence will be
                connected during the backend integration step.
              </p>
            </div>
          </div>
        </form>
      </Modal>

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Incident records currently use fictional demo data.
      </p>
    </section>
  )
}
