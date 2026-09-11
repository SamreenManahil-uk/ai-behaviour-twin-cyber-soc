import {
  Braces,
  FilterX,
  SearchX,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import {
  demoEvents,
  type DemoSecurityEvent,
} from '../data/demoEventsAlerts'
import { useToast } from '../hooks/useToast'

const pageSize = 6

export function EventsPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const [source, setSource] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedEvent, setSelectedEvent] =
    useState<DemoSecurityEvent | null>(null)
  const { showToast } = useToast()

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return demoEvents.filter((event) => {
      const matchesSearch =
        !term ||
        [
          event.id,
          event.type,
          event.endpoint,
          event.user,
          event.process,
          event.destinationIp,
        ].some((value) => value.toLowerCase().includes(term))

      const matchesSeverity =
        severity === 'All' || event.severity === severity
      const matchesSource = source === 'All' || event.source === source

      return matchesSearch && matchesSeverity && matchesSource
    })
  }, [search, severity, source])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleEvents = filteredEvents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  function clearFilters() {
    setSearch('')
    setSeverity('All')
    setSource('All')
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="SIEM event ingestion"
        title="Security Events"
        description="Inspect normalised Windows, Linux, network and simulated EDR telemetry entering the detection pipeline."
        badge={<Badge variant="purple">Demo telemetry</Badge>}
        actions={
          <Button
            leftIcon={<Sparkles size={16} />}
            onClick={() =>
              showToast({
                title: 'Event simulation queued',
                description:
                  'No real device was accessed. This is a demonstration action.',
                variant: 'info',
              })
            }
          >
            Simulate event
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total events', '20,842', 'text-brand-400'],
          ['Last hour', '1,286', 'text-low'],
          ['Malicious', '146', 'text-critical'],
          ['Sources online', '4/4', 'text-healthy'],
        ].map(([label, value, colour]) => (
          <article key={label} className="soc-panel p-4">
            <p className="soc-label">{label}</p>
            <p className={`technical-value mt-3 text-2xl font-bold ${colour}`}>
              {value}
            </p>
          </article>
        ))}
      </div>

      <article className="soc-panel overflow-hidden">
        <div className="border-b border-[var(--border)] p-4 sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_auto_auto_auto]">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search event, endpoint, process or IP..."
              label="Search security events"
            />

            <Select
              label="Filter severity"
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All severities', value: 'All' },
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
                { label: 'Information', value: 'Info' },
              ]}
            />

            <Select
              label="Filter source"
              value={source}
              onChange={(event) => {
                setSource(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All sources', value: 'All' },
                { label: 'Windows Security', value: 'Windows Security' },
                { label: 'Linux Audit', value: 'Linux Audit' },
                { label: 'Network Flow', value: 'Network Flow' },
                { label: 'EDR Simulator', value: 'EDR Simulator' },
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

          <p className="mt-3 text-xs text-[var(--foreground-muted)]">
            {filteredEvents.length} events match the current filters
          </p>
        </div>

        {visibleEvents.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No events found"
              description="No security events match your current search and filter combination."
              icon={SearchX}
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                    {[
                      'Event',
                      'Endpoint / User',
                      'Process',
                      'Destination',
                      'Source',
                      'Severity',
                      'Timestamp',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="soc-label px-5 py-3.5 !text-[0.6rem]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {visibleEvents.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="cursor-pointer transition hover:bg-[var(--surface-hover)]/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold">{event.type}</p>
                        <p className="technical-value mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                          {event.id}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="technical-value text-xs font-semibold text-brand-400">
                          {event.endpoint}
                        </p>
                        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                          {event.user}
                        </p>
                      </td>
                      <td className="technical-value px-5 py-4 text-xs">
                        {event.process}
                      </td>
                      <td className="technical-value px-5 py-4 text-xs text-[var(--foreground-secondary)]">
                        {event.destinationIp}
                      </td>
                      <td className="px-5 py-4">
                        <Badge>{event.source}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <SeverityBadge severity={event.severity} />
                      </td>
                      <td className="technical-value whitespace-nowrap px-5 py-4 text-xs text-[var(--foreground-muted)]">
                        {event.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={filteredEvents.length}
              onPageChange={setPage}
            />
          </>
        )}
      </article>

      <Drawer
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.type ?? 'Security event'}
        description={
          selectedEvent
            ? `${selectedEvent.id} · ${selectedEvent.timestamp}`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </Button>
            <Button
              leftIcon={<Sparkles size={16} />}
              onClick={() =>
                showToast({
                  title: 'AI analysis requested',
                  description:
                    'This demo event has been queued for model scoring.',
                  variant: 'info',
                })
              }
            >
              Run AI analysis
            </Button>
          </>
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <SeverityBadge severity={selectedEvent.severity} />
              <Badge variant="purple">{selectedEvent.source}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Endpoint', selectedEvent.endpoint],
                ['User', selectedEvent.user],
                ['Process', selectedEvent.process],
                ['Destination IP', selectedEvent.destinationIp],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <p className="soc-label !text-[0.55rem]">{label}</p>
                  <p className="technical-value mt-2 break-all text-xs font-semibold">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Braces size={17} className="text-brand-400" />
                <p className="soc-label">Validated raw payload</p>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[#030810] p-4 font-mono text-xs leading-6 text-slate-300">
                {JSON.stringify(selectedEvent.rawPayload, null, 2)}
              </pre>
              <p className="mt-3 text-[0.6875rem] leading-5 text-[var(--foreground-muted)]">
                This fictional JSON is displayed as text only and is never
                executed.
              </p>
            </section>
          </div>
        )}
      </Drawer>

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Event values are fictional demo fixtures and do not represent real
        endpoint telemetry.
      </p>
    </section>
  )
}
