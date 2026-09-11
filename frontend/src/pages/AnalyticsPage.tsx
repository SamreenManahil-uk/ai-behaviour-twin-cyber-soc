import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  Download,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import {
  analyticsTimeline,
  detectionSources,
  topRiskEndpoints,
} from '../data/demoIntelligence'

export function AnalyticsPage() {
  const [range, setRange] = useState('7D')

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Detection performance"
        title="Security Analytics"
        description="Analyse fictional SOC trends, detection sources, investigation volume and endpoint risk."
        badge={<Badge variant="purple">Demo analytics</Badge>}
        actions={
          <>
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              {['24H', '7D', '30D', '90D'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={[
                    'rounded-lg px-3 py-2 text-xs font-semibold transition',
                    range === item
                      ? 'bg-brand-400 text-slate-950'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
                  ].join(' ')}
                >
                  {item}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
            >
              Export report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Mean response time', '12m 24s', '-18%', ShieldCheck, 'text-healthy'],
          ['Detection volume', '826', '+14%', Activity, 'text-brand-400'],
          ['Escalation rate', '8.4%', '-2.1%', Target, 'text-medium'],
          ['AI-assisted triage', '76%', '+9%', BrainCircuit, 'text-violet-400'],
        ].map(([label, value, trend, Icon, colour]) => {
          const MetricIcon = Icon as typeof ShieldCheck

          return (
            <article key={String(label)} className="soc-panel-interactive p-5">
              <div className="flex items-center justify-between">
                <p className="soc-label">{String(label)}</p>
                <MetricIcon size={19} className={String(colour)} />
              </div>
              <p className="technical-value mt-5 text-2xl font-bold">
                {String(value)}
              </p>
              <p className={`mt-2 text-xs font-semibold ${String(colour)}`}>
                {String(trend)} vs previous period
              </p>
            </article>
          )
        })}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.5fr_1fr]">
        <article className="soc-panel overflow-hidden">
          <header className="border-b border-[var(--border)] p-5 sm:p-6">
            <p className="soc-label">Selected period: {range}</p>
            <h3 className="soc-value mt-2 text-lg">
              Events and alert activity
            </h3>
          </header>

          <div className="h-80 p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsTimeline}
                margin={{ top: 5, right: 4, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="eventsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 1111 }}
                  stroke="var(--foreground-muted)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  stroke="var(--foreground-muted)"
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#22d3ee"
                  fill="url(#eventsAnalytics)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke="#f43f5e"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="soc-panel overflow-hidden">
          <header className="border-b border-[var(--border)] p-5 sm:p-6">
            <p className="soc-label">Signal comparison</p>
            <h3 className="soc-value mt-2 text-lg">Detection sources</h3>
          </header>

          <div className="h-80 p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={detectionSources}
                layout="vertical"
                margin={{ top: 5, right: 10, bottom: 0, left: 18 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  stroke="var(--foreground-muted)"
                />
                <YAxis
                  dataKey="source"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={88}
                  tick={{ fontSize: 10 }}
                  stroke="var(--foreground-muted)"
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="detections"
                  fill="#a78bfa"
                  radius={[0, 6, 6, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="soc-panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="soc-label">Model transparency</p>
              <h3 className="soc-value mt-2 text-lg">
                Detection quality indicators
              </h3>
            </div>
            <BrainCircuit className="text-violet-400" size={21} />
          </div>

          <div className="mt-6 space-y-5">
            {detectionSources.map((source) => (
              <div key={source.source}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    {source.source}
                  </span>
                  <span className="technical-value text-xs font-bold">
                    {source.precision}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-400"
                    style={{ width: `${source.precision}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[0.6875rem] leading-5 text-[var(--foreground-muted)]">
            Values are UI demonstrations. Production model quality must use
            measured evaluation reports rather than dashboard fixture values.
          </p>
        </article>

        <article className="soc-panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="soc-label">Prioritised assets</p>
              <h3 className="soc-value mt-2 text-lg">Highest endpoint risk</h3>
            </div>
            <ChartNoAxesCombined className="text-critical" size={21} />
          </div>

          <div className="mt-6 space-y-4">
            {topRiskEndpoints.map((endpoint, index) => (
              <div
                key={endpoint.endpoint}
                className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3"
              >
                <span className="technical-value text-xs text-[var(--foreground-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="mb-2 flex justify-between gap-3">
                    <span className="technical-value text-xs font-semibold">
                      {endpoint.endpoint}
                    </span>
                    <span className="technical-value text-xs font-bold text-critical">
                      {endpoint.risk}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-high to-critical"
                      style={{ width: `${endpoint.risk}%` }}
                    />
                  </div>
                </div>
                <Badge variant="danger">High risk</Badge>
              </div>
            ))}
          </div>
        </article>
      </div>

      <p className="text-center text-[0.6875rem] text-[var(--foreground-muted)]">
        Analytics values are fictional interface fixtures unless explicitly
        sourced from the documented ML evaluation reports.
      </p>
    </section>
  )
}
