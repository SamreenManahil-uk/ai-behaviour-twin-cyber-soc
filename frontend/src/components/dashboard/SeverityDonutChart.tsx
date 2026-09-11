import { PieChart as PieChartIcon } from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { severityDistribution } from '../../data/demoSocData'

export function SeverityDonutChart() {
  const total = severityDistribution.reduce(
    (sum, item) => sum + item.value,
    0,
  )

  return (
    <article className="soc-panel min-w-0 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="soc-label">Open detections</p>
          <h3 className="soc-value mt-2 text-lg">Severity distribution</h3>
        </div>
        <PieChartIcon className="text-brand-400" size={21} />
      </div>

      <div className="relative mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={severityDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={61}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
            >
              {severityDistribution.map((item) => (
                <Cell key={item.name} fill={item.colour} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="technical-value text-3xl font-bold">{total}</span>
          <span className="mt-1 text-[0.65rem] text-[var(--foreground-muted)]">
            total alerts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {severityDistribution.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.colour }}
              />
              {item.name}
            </span>
            <span className="technical-value text-xs font-bold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
