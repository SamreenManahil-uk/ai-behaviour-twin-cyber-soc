import {
  FilterX,
  MonitorUp,
  SearchX,
  Server,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { EndpointDetailsDrawer } from '../components/endpoints/EndpointDetailsDrawer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import {
  demoEndpoints,
  type DemoEndpoint,
} from '../data/demoOperations'
import { useToast } from '../hooks/useToast'

const pageSize = 6

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

export function EndpointsPage() {
  const [search, setSearch] = useState('')
  const [operatingSystem, setOperatingSystem] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('risk-desc')
  const [page, setPage] = useState(1)
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<DemoEndpoint | null>(null)
  const { showToast } = useToast()

  const filteredEndpoints = useMemo(() => {
    const term = search.trim().toLowerCase()

    const result = demoEndpoints.filter((endpoint) => {
      const matchesSearch =
        !term ||
        [
          endpoint.id,
          endpoint.hostname,
          endpoint.ipAddress,
          endpoint.owner,
        ].some((value) => value.toLowerCase().includes(term))

      return (
        matchesSearch &&
        (operatingSystem === 'All' ||
          endpoint.operatingSystem === operatingSystem) &&
        (status === 'All' || endpoint.status === status)
      )
    })

    return [...result].sort((first, second) => {
      if (sort === 'risk-asc') {
        return first.riskScore - second.riskScore
      }

      if (sort === 'hostname') {
        return first.hostname.localeCompare(second.hostname)
      }

      return second.riskScore - first.riskScore
    })
  }, [search, operatingSystem, status, sort])

  const totalPages = Math.max(1, Math.ceil(filteredEndpoints.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleEndpoints = filteredEndpoints.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  function clearFilters() {
    setSearch('')
    setOperatingSystem('All')
    setStatus('All')
    setSort('risk-desc')
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Endpoint detection and response"
        title="Endpoint Security"
        description="Monitor fictional Windows, Linux and macOS assets, behavioural profiles and endpoint risk."
        badge={<Badge variant="purple">Simulated EDR</Badge>}
        actions={
          <Button
            leftIcon={<MonitorUp size={16} />}
            onClick={() =>
              showToast({
                title: 'Endpoint enrolment opened',
                description:
                  'No real endpoint agent is installed in this portfolio prototype.',
                variant: 'info',
              })
            }
          >
            Enrol endpoint
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Protected', '1,248', 'text-brand-400'],
          ['Healthy', '1,164', 'text-healthy'],
          ['At risk', '58', 'text-medium'],
          ['Critical/offline', '26', 'text-critical'],
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
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(18rem,1fr)_auto_auto_auto_auto]">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search hostname, owner or IP..."
              label="Search endpoints"
            />
            <Select
              label="Filter operating system"
              value={operatingSystem}
              onChange={(event) => {
                setOperatingSystem(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All operating systems', value: 'All' },
                { label: 'Windows', value: 'Windows' },
                { label: 'Linux', value: 'Linux' },
                { label: 'macOS', value: 'macOS' },
              ]}
            />
            <Select
              label="Filter endpoint status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All statuses', value: 'All' },
                { label: 'Healthy', value: 'Healthy' },
                { label: 'At Risk', value: 'At Risk' },
                { label: 'Critical', value: 'Critical' },
                { label: 'Offline', value: 'Offline' },
                { label: 'Isolated', value: 'Isolated' },
              ]}
            />
            <Select
              label="Sort endpoints"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              options={[
                { label: 'Risk: highest', value: 'risk-desc' },
                { label: 'Risk: lowest', value: 'risk-asc' },
                { label: 'Hostname A–Z', value: 'hostname' },
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
        </div>

        {visibleEndpoints.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No endpoints found"
              description="No endpoints match the selected search and filters."
              icon={SearchX}
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                    {[
                      'Endpoint',
                      'Operating system',
                      'Owner',
                      'Status',
                      'Alerts',
                      'Risk',
                      'Last seen',
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
                  {visibleEndpoints.map((endpoint) => (
                    <tr
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className="cursor-pointer transition hover:bg-[var(--surface-hover)]/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400">
                            <Server size={17} />
                          </div>
                          <div>
                            <p className="technical-value text-xs font-bold">
                              {endpoint.hostname}
                            </p>
                            <p className="technical-value mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                              {endpoint.ipAddress}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="info">
                          {endpoint.operatingSystem}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--foreground-secondary)]">
                        {endpoint.owner}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(endpoint.status)} dot>
                          {endpoint.status}
                        </Badge>
                      </td>
                      <td className="technical-value px-5 py-4 text-xs font-semibold">
                        {endpoint.alertCount}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)]">
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
                          <span className="technical-value text-xs font-bold">
                            {endpoint.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--foreground-muted)]">
                        {endpoint.lastSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={filteredEndpoints.length}
              onPageChange={setPage}
            />
          </>
        )}
      </article>

      <EndpointDetailsDrawer
        endpoint={selectedEndpoint}
        onClose={() => setSelectedEndpoint(null)}
      />

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Endpoint records, agent status and response controls are safely
        simulated. No real device is accessed.
      </p>
    </section>
  )
}
