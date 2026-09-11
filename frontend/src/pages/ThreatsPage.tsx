import {
  FilterX,
  Plus,
  SearchX,
  ShieldCheck,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import {
  threatIndicators,
  type IndicatorType,
  type ThreatIndicator,
} from '../data/demoIntelligence'
import { useToast } from '../hooks/useToast'

const pageSize = 5

function validateIndicator(type: IndicatorType, value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Indicator value is required.'
  }

  if (type === 'IP Address') {
    const parts = trimmed.split('.')
    const valid =
      parts.length === 4 &&
      parts.every((part) => {
        const number = Number(part)
        return /^\d{1,3}$/.test(part) && number >= 0 && number <= 255
      })

    return valid ? '' : 'Enter a valid IPv4 address.'
  }

  if (type === 'Domain') {
    return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
      trimmed,
    )
      ? ''
      : 'Enter a valid domain name.'
  }

  if (type === 'File Hash') {
    return /^[a-f0-9]{64}$/i.test(trimmed)
      ? ''
      : 'File hash must be a 64-character SHA-256 value.'
  }

  if (type === 'URL') {
    try {
      const url = new URL(trimmed)
      return url.protocol === 'http:' || url.protocol === 'https:'
        ? ''
        : 'URL must use HTTP or HTTPS.'
    } catch {
      return 'Enter a valid absolute URL.'
    }
  }

  return trimmed.length <= 160
    ? ''
    : 'Process name must not exceed 160 characters.'
}

function confidenceColour(confidence: number) {
  if (confidence >= 85) {
    return 'bg-critical'
  }

  if (confidence >= 70) {
    return 'bg-medium'
  }

  return 'bg-low'
}

export function ThreatsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All')
  const [confidenceFilter, setConfidenceFilter] = useState('0')
  const [page, setPage] = useState(1)
  const [selectedThreat, setSelectedThreat] =
    useState<ThreatIndicator | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [indicatorType, setIndicatorType] =
    useState<IndicatorType>('IP Address')
  const [indicatorValue, setIndicatorValue] = useState('')
  const [threatName, setThreatName] = useState('')
  const [confidence, setConfidence] = useState(75)
  const [formError, setFormError] = useState('')
  const { showToast } = useToast()

  const filteredThreats = useMemo(() => {
    const term = search.trim().toLowerCase()
    const minimumConfidence = Number(confidenceFilter)

    return threatIndicators.filter((threat) => {
      const matchesSearch =
        !term ||
        [
          threat.id,
          threat.value,
          threat.name,
          threat.source,
        ].some((value) => value.toLowerCase().includes(term))

      return (
        matchesSearch &&
        (typeFilter === 'All' || threat.type === typeFilter) &&
        (activeFilter === 'All' ||
          String(threat.active) === activeFilter) &&
        threat.confidence >= minimumConfidence
      )
    })
  }, [search, typeFilter, activeFilter, confidenceFilter])

  const totalPages = Math.max(1, Math.ceil(filteredThreats.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleThreats = filteredThreats.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  function clearFilters() {
    setSearch('')
    setTypeFilter('All')
    setActiveFilter('All')
    setConfidenceFilter('0')
    setPage(1)
  }

  function submitThreat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const indicatorError = validateIndicator(
      indicatorType,
      indicatorValue,
    )

    if (indicatorError) {
      setFormError(indicatorError)
      return
    }

    if (threatName.trim().length < 3) {
      setFormError('Threat name must contain at least 3 characters.')
      return
    }

    setFormError('')
    setCreateOpen(false)
    showToast({
      title: 'Threat indicator validated',
      description:
        'The real Admin-only API will persist this indicator during integration.',
      variant: 'success',
    })
    setIndicatorValue('')
    setThreatName('')
    setConfidence(75)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Threat intelligence"
        title="Indicators and Intelligence"
        description="Review fictional IP, domain, hash, URL and process indicators used during SOC enrichment."
        badge={<Badge variant="purple">Demo intelligence</Badge>}
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            Add indicator
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active indicators', '6', 'text-critical'],
          ['High confidence', '3', 'text-medium'],
          ['Sources', '5', 'text-brand-400'],
          ['Enriched today', '18', 'text-healthy'],
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
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[1fr_auto_auto_auto_auto]">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search value, name or source..."
              label="Search threat intelligence"
            />

            <Select
              label="Filter indicator type"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All indicator types', value: 'All' },
                { label: 'IP Address', value: 'IP Address' },
                { label: 'Domain', value: 'Domain' },
                { label: 'File Hash', value: 'File Hash' },
                { label: 'URL', value: 'URL' },
                { label: 'Process', value: 'Process' },
              ]}
            />

            <Select
              label="Filter active status"
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'All statuses', value: 'All' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
            />

            <Select
              label="Minimum confidence"
              value={confidenceFilter}
              onChange={(event) => {
                setConfidenceFilter(event.target.value)
                setPage(1)
              }}
              options={[
                { label: 'Any confidence', value: '0' },
                { label: '70% or higher', value: '70' },
                { label: '85% or higher', value: '85' },
                { label: '90% or higher', value: '90' },
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

        {visibleThreats.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No indicators found"
              description="No threat-intelligence indicators match these filters."
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
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                    {[
                      'Indicator',
                      'Type',
                      'Threat name',
                      'Source',
                      'Confidence',
                      'Status',
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
                  {visibleThreats.map((threat) => (
                    <tr
                      key={threat.id}
                      onClick={() => setSelectedThreat(threat)}
                      className="cursor-pointer transition hover:bg-[var(--surface-hover)]/70"
                    >
                      <td className="px-5 py-4">
                        <p className="technical-value max-w-64 truncate text-xs font-semibold text-brand-400">
                          {threat.value}
                        </p>
                        <p className="technical-value mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                          {threat.id}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="info">{threat.type}</Badge>
                      </td>
                      <td className="max-w-60 truncate px-5 py-4 text-sm font-medium">
                        {threat.name}
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--foreground-secondary)]">
                        {threat.source}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                            <div
                              className={`h-full rounded-full ${confidenceColour(threat.confidence)}`}
                              style={{ width: `${threat.confidence}%` }}
                            />
                          </div>
                          <span className="technical-value text-xs font-bold">
                            {threat.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={threat.active ? 'danger' : 'neutral'}
                          dot
                        >
                          {threat.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="technical-value px-5 py-4 text-xs text-[var(--foreground-muted)]">
                        {threat.lastSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={filteredThreats.length}
              onPageChange={setPage}
            />
          </>
        )}
      </article>

      <Drawer
        open={selectedThreat !== null}
        onClose={() => setSelectedThreat(null)}
        title={selectedThreat?.name ?? 'Threat indicator'}
        description={
          selectedThreat
            ? `${selectedThreat.id} · ${selectedThreat.type}`
            : undefined
        }
        footer={
          <Button
            variant="outline"
            onClick={() => setSelectedThreat(null)}
          >
            Close
          </Button>
        }
      >
        {selectedThreat && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge variant="info">{selectedThreat.type}</Badge>
              <Badge
                variant={selectedThreat.active ? 'danger' : 'neutral'}
                dot
              >
                {selectedThreat.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
              <p className="soc-label">Indicator value</p>
              <p className="technical-value mt-3 break-all text-sm font-semibold text-brand-400">
                {selectedThreat.value}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Confidence', `${selectedThreat.confidence}%`],
                ['Source', selectedThreat.source],
                ['First seen', selectedThreat.firstSeen],
                ['Last seen', selectedThreat.lastSeen],
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

            <div className="flex gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
              <ShieldCheck className="shrink-0 text-healthy" size={19} />
              <p className="text-xs leading-5 text-[var(--foreground-secondary)]">
                Intelligence records enrich alerts but do not independently
                prove malicious activity.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          setFormError('')
        }}
        title="Add threat indicator"
        description="Validate an indicator before submitting it to the Admin-only API."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-threat-form">
              Validate indicator
            </Button>
          </>
        }
      >
        <form
          id="create-threat-form"
          onSubmit={submitThreat}
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Indicator type
            </span>
            <Select
              label="Indicator type"
              value={indicatorType}
              onChange={(event) => {
                setIndicatorType(event.target.value as IndicatorType)
                setFormError('')
              }}
              className="w-full"
              options={[
                { label: 'IP Address', value: 'IP Address' },
                { label: 'Domain', value: 'Domain' },
                { label: 'File Hash (SHA-256)', value: 'File Hash' },
                { label: 'URL', value: 'URL' },
                { label: 'Process', value: 'Process' },
              ]}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Indicator value
            </span>
            <input
              value={indicatorValue}
              onChange={(event) => {
                setIndicatorValue(event.target.value)
                setFormError('')
              }}
              placeholder="Enter IP, domain, hash, URL or process"
              className="technical-value h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs outline-none focus:border-brand-400/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Threat name</span>
            <input
              value={threatName}
              onChange={(event) => {
                setThreatName(event.target.value)
                setFormError('')
              }}
              maxLength={160}
              placeholder="Descriptive threat name"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-brand-400/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-medium">
              Confidence
              <span className="technical-value text-brand-400">
                {confidence}%
              </span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
              className="w-full accent-cyan-400"
            />
          </label>

          {formError && (
            <p className="rounded-xl border border-critical/20 bg-critical/10 p-3 text-xs text-critical">
              {formError}
            </p>
          )}
        </form>
      </Modal>

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Indicators are fictional demonstration data and not a live threat feed.
      </p>
    </section>
  )
}
