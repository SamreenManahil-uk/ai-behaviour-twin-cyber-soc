import { Activity, MoreHorizontal } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { threatActivity } from '../../data/demoSocData'

export function ThreatActivityChart() {
  return (
    <article className="soc-panel min-w-0 overflow-hidden">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="soc-label">Last 24 hours</p>
            <h3 className="soc-value mt-1 text-lg">Threat activity</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[0.6875rem]">
          <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            Malicious
          </span>
          <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Anomalous
          </span>
          <button
            type="button"
            className="rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
            aria-label="Chart options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <div className="h-80 p-3 pb-4 pr-5 sm:p-5 sm:pr-7">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={threatActivity}
            margin={{ top: 10, right: 4, bottom: 0, left: -22 }}
          >
            <defs>
              <linearGradient id="maliciousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--foreground-muted)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="var(--foreground-muted)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-card)',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Area
              type="monotone"
              dataKey="anomalous"
              stroke="#a78bfa"
              fill="url(#anomalyGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="malicious"
              stroke="#22d3ee"
              fill="url(#maliciousGradient)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
