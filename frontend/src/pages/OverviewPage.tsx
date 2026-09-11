import {
  Activity,
  BellRing,
  Server,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { EndpointHealth } from '../components/dashboard/EndpointHealth'
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed'
import { MetricCard } from '../components/dashboard/MetricCard'
import { RecentAlertsTable } from '../components/dashboard/RecentAlertsTable'
import { SecurityScoreGauge } from '../components/dashboard/SecurityScoreGauge'
import { SeverityDonutChart } from '../components/dashboard/SeverityDonutChart'
import { ThreatActivityChart } from '../components/dashboard/ThreatActivityChart'
import { ThreatCarousel } from '../components/dashboard/ThreatCarousel'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function OverviewPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="soc-label text-brand-400">
              Unified security operations
            </p>
            <Badge variant="purple">Demo telemetry</Badge>
          </div>

          <h2 className="soc-value text-2xl sm:text-3xl">
            Good afternoon, SOC Analyst
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-secondary)]">
            Your environment is stable, but four critical detections require
            immediate analyst attention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-healthy" />
            <span className="text-xs font-semibold text-healthy">
              Detection pipeline operational
            </span>
          </div>

          <Button leftIcon={<Sparkles size={16} />}>
            Run threat analysis
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Events analysed"
          value="2.48M"
          detail="Across all monitored sources"
          trend={12.4}
          icon={Activity}
          iconColour="text-brand-400"
          featured
        />
        <MetricCard
          label="Critical threats"
          value="12"
          detail="4 require immediate action"
          trend={-8.1}
          icon={ShieldAlert}
          iconColour="text-critical"
        />
        <MetricCard
          label="Active incidents"
          value="7"
          detail="3 assigned to your queue"
          trend={16.7}
          icon={BellRing}
          iconColour="text-high"
        />
        <MetricCard
          label="Protected endpoints"
          value="1,248"
          detail="98.7% currently reporting"
          trend={2.3}
          icon={Server}
          iconColour="text-healthy"
        />
      </div>

      <ThreatCarousel />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.8fr)]">
        <ThreatActivityChart />
        <SecurityScoreGauge score={92} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SeverityDonutChart />
        <EndpointHealth />
        <LiveActivityFeed />
      </div>

      <RecentAlertsTable />

      <p className="pb-2 text-center text-[0.6875rem] leading-5 text-[var(--foreground-muted)]">
        Dashboard values currently use typed fictional demo telemetry. Real
        ASP.NET API integration will replace these fixtures in a later step.
      </p>
    </section>
  )
}
