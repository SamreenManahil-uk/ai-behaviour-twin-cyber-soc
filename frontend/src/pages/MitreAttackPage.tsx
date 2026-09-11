import {
  BookOpen,
  Crosshair,
  SearchX,
  ShieldAlert,
  Swords,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import {
  mitreTechniques,
  type MitreTechnique,
} from '../data/demoIntelligence'

const tactics = [
  'Execution',
  'Credential Access',
  'Privilege Escalation',
  'Collection',
  'Command and Control',
  'Exfiltration',
]

export function MitreAttackPage() {
  const [search, setSearch] = useState('')
  const [tactic, setTactic] = useState('All')
  const [selectedTechnique, setSelectedTechnique] =
    useState<MitreTechnique | null>(null)

  const filteredTechniques = useMemo(() => {
    const term = search.trim().toLowerCase()

    return mitreTechniques.filter((technique) => {
      const matchesSearch =
        !term ||
        [
          technique.id,
          technique.name,
          technique.tactic,
          technique.description,
        ].some((value) => value.toLowerCase().includes(term))

      return matchesSearch && (tactic === 'All' || technique.tactic === tactic)
    })
  }, [search, tactic])

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Adversary behaviour"
        title="MITRE ATT&CK Coverage"
        description="Explore fictional alert mappings to established adversary tactics and techniques."
        badge={<Badge variant="purple">Demo mappings</Badge>}
        actions={
          <Button variant="outline" leftIcon={<BookOpen size={16} />}>
            Coverage report
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {tactics.map((item) => {
          const count = mitreTechniques
            .filter((technique) => technique.tactic === item)
            .reduce((sum, technique) => sum + technique.detections, 0)

          return (
            <button
              key={item}
              type="button"
              onClick={() => setTactic(item)}
              className={[
                'soc-panel-interactive p-4 text-left',
                tactic === item ? 'border-brand-400/30 bg-brand-400/5' : '',
              ].join(' ')}
            >
              <p className="soc-label !text-[0.55rem]">{item}</p>
              <p className="technical-value mt-3 text-2xl font-bold">
                {count}
              </p>
              <p className="mt-1 text-[0.625rem] text-[var(--foreground-muted)]">
                mapped detections
              </p>
            </button>
          )
        })}
      </div>

      <article className="soc-panel p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search technique ID, name or tactic..."
            label="Search MITRE techniques"
          />
          <Select
            label="Filter MITRE tactic"
            value={tactic}
            onChange={(event) => setTactic(event.target.value)}
            options={[
              { label: 'All tactics', value: 'All' },
              ...tactics.map((item) => ({ label: item, value: item })),
            ]}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setTactic('All')
            }}
          >
            Clear filters
          </Button>
        </div>
      </article>

      {filteredTechniques.length === 0 ? (
        <EmptyState
          title="No techniques found"
          description="No MITRE ATT&CK techniques match the current filters."
          icon={SearchX}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setTactic('All')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTechniques.map((technique) => (
            <button
              key={technique.id}
              type="button"
              onClick={() => setSelectedTechnique(technique)}
              className="soc-panel-interactive group p-5 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="technical-value rounded-lg bg-brand-400/10 px-2.5 py-1.5 text-xs font-bold text-brand-400">
                  {technique.id}
                </span>
                <SeverityBadge severity={technique.severity} />
              </div>

              <h3 className="soc-value mt-5 text-lg group-hover:text-brand-300">
                {technique.name}
              </h3>

              <p className="mt-1 text-xs font-semibold text-violet-400">
                {technique.tactic}
              </p>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--foreground-secondary)]">
                {technique.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-xs text-[var(--foreground-muted)]">
                  Detections
                </span>
                <span className="technical-value text-lg font-bold">
                  {technique.detections}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={selectedTechnique !== null}
        onClose={() => setSelectedTechnique(null)}
        title={
          selectedTechnique
            ? `${selectedTechnique.id} ${selectedTechnique.name}`
            : 'MITRE technique'
        }
        description={selectedTechnique?.tactic}
        footer={
          <Button
            variant="outline"
            onClick={() => setSelectedTechnique(null)}
          >
            Close
          </Button>
        }
      >
        {selectedTechnique && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <SeverityBadge severity={selectedTechnique.severity} />
              <Badge variant="purple">{selectedTechnique.tactic}</Badge>
              <Badge variant="info">
                {selectedTechnique.detections} detections
              </Badge>
            </div>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
              <div className="flex gap-3">
                <Swords className="shrink-0 text-brand-400" size={21} />
                <p className="text-sm leading-6 text-[var(--foreground-secondary)]">
                  {selectedTechnique.description}
                </p>
              </div>
            </section>

            <section>
              <p className="soc-label mb-3">Observed evidence</p>
              <div className="space-y-2">
                {selectedTechnique.evidence.map((evidence) => (
                  <div
                    key={evidence}
                    className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                  >
                    <ShieldAlert
                      size={17}
                      className="mt-0.5 shrink-0 text-medium"
                    />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      {evidence}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="soc-label mb-3">Applicable platforms</p>
              <div className="flex flex-wrap gap-2">
                {selectedTechnique.platforms.map((platform) => (
                  <Badge key={platform} variant="info">
                    {platform}
                  </Badge>
                ))}
              </div>
            </section>

            <div className="flex gap-3 rounded-xl border border-brand-400/15 bg-brand-400/5 p-4">
              <Crosshair className="shrink-0 text-brand-400" size={18} />
              <p className="text-xs leading-5 text-[var(--foreground-secondary)]">
                MITRE mapping provides analyst context; it does not prove that
                a specific adversary performed the activity.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Technique mappings are portfolio demonstrations and require analyst
        validation.
      </p>
    </section>
  )
}
