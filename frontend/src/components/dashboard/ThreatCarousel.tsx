import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  ExternalLink,
  Pause,
  Play,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { criticalThreats } from '../../data/demoSocData'
import { Button } from '../ui/Button'
import { SeverityBadge } from '../ui/SeverityBadge'

export function ThreatCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % criticalThreats.length)
    }, 5500)

    return () => window.clearInterval(interval)
  }, [paused])

  const activeThreat = criticalThreats[activeIndex]

  function showPrevious() {
    setActiveIndex(
      (current) =>
        (current - 1 + criticalThreats.length) % criticalThreats.length,
    )
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % criticalThreats.length)
  }

  return (
    <article
      className="soc-panel relative overflow-hidden border-critical/15"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.11),transparent_24rem)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-critical/70 to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-critical/10 text-critical">
              <Crosshair size={20} />
            </div>
            <div>
              <p className="soc-label !text-critical">
                Critical threat spotlight
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Auto-rotating priority queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={showPrevious}
              className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              aria-label="Previous threat"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              aria-label={paused ? 'Resume carousel' : 'Pause carousel'}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              type="button"
              onClick={showNext}
              className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              aria-label="Next threat"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge severity="Critical" />
              <span className="technical-value text-xs text-[var(--foreground-muted)]">
                {activeThreat.id}
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                {activeThreat.time}
              </span>
            </div>

            <h3 className="soc-value mt-4 text-xl sm:text-2xl">
              {activeThreat.title}
            </h3>

            <p className="technical-value mt-2 text-sm text-brand-400">
              {activeThreat.endpoint} · {activeThreat.technique}
            </p>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--foreground-secondary)]">
              {activeThreat.evidence}
            </p>
          </div>

          <div className="flex items-end gap-5">
            <div>
              <p className="soc-label">Risk score</p>
              <p className="technical-value mt-1 text-4xl font-bold text-critical">
                {activeThreat.riskScore}
                <span className="text-sm text-[var(--foreground-muted)]">
                  /100
                </span>
              </p>
            </div>

            <Button
              variant="outline"
              rightIcon={<ExternalLink size={15} />}
            >
              Investigate
            </Button>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-2">
          {criticalThreats.map((threat, index) => (
            <button
              key={threat.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                'h-1.5 rounded-full transition-all',
                index === activeIndex
                  ? 'w-9 bg-critical'
                  : 'w-3 bg-[var(--foreground-muted)]/40 hover:bg-[var(--foreground-muted)]',
              ].join(' ')}
              aria-label={`Show threat ${index + 1}`}
              aria-current={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
