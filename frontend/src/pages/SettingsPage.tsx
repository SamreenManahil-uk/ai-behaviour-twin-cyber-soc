import {
  Bell,
  CheckCircle2,
  KeyRound,
  MonitorCog,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'

type ToggleProps = {
  checked: boolean
  label: string
  description: string
  onChange: (value: boolean) => void
}

function PreferenceToggle({
  checked,
  label,
  description,
  onChange,
}: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 border-b border-border py-5 last:border-0">
      <span>
        <span className="block font-medium text-heading">{label}</span>
        <span className="mt-1 block text-sm text-muted">{description}</span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span className="relative h-6 w-11 shrink-0 rounded-full bg-surface-strong transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2">
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('preferences')
  const [desktopAlerts, setDesktopAlerts] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [compactTables, setCompactTables] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [saved, setSaved] = useState(false)

  const savePreferences = () => {
    localStorage.setItem(
      'soc-ui-preferences',
      JSON.stringify({
        desktopAlerts,
        criticalOnly,
        compactTables,
        autoRefresh,
      }),
    )
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const sections = [
    { id: 'profile', label: 'Analyst profile', icon: UserRound },
    { id: 'preferences', label: 'Preferences', icon: MonitorCog },
    { id: 'security', label: 'Security', icon: KeyRound },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace administration"
        title="Settings"
        description="Manage analyst workspace preferences and review account security."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="soc-card h-fit p-3" aria-label="Settings sections">
          {sections.map((section) => {
            const Icon = section.icon
            const selected = activeSection === section.id

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  selected
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-surface-strong hover:text-heading'
                }`}
              >
                <Icon size={18} />
                {section.label}
              </button>
            )
          })}
        </nav>

        <section className="soc-card p-6">
          {activeSection === 'profile' && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
                  <UserRound size={26} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-heading">
                    SOC analyst account
                  </h2>
                  <p className="text-sm text-muted">
                    Identity is supplied by JWT authentication
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wider text-muted">Role</p>
                  <p className="mt-2 font-semibold text-heading">SOC Analyst</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Access policy
                  </p>
                  <p className="mt-2 font-semibold text-heading">SocOperations</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Bell className="text-accent" size={21} />
                <h2 className="text-lg font-semibold text-heading">
                  Dashboard preferences
                </h2>
              </div>
              <p className="mb-3 text-sm text-muted">
                These prototype preferences are stored only in this browser.
              </p>

              <PreferenceToggle
                checked={desktopAlerts}
                label="Alert notifications"
                description="Show visual notifications for new security alerts."
                onChange={setDesktopAlerts}
              />
              <PreferenceToggle
                checked={criticalOnly}
                label="Critical alerts only"
                description="Reduce noise by prioritising critical detections."
                onChange={setCriticalOnly}
              />
              <PreferenceToggle
                checked={compactTables}
                label="Compact table density"
                description="Display more SOC records within each table."
                onChange={setCompactTables}
              />
              <PreferenceToggle
                checked={autoRefresh}
                label="Automatic dashboard refresh"
                description="Refresh monitoring views while the dashboard is open."
                onChange={setAutoRefresh}
              />

              <div className="mt-6 flex items-center gap-4">
                <Button onClick={savePreferences}>
                  <Save size={16} />
                  Save preferences
                </Button>
                {saved && (
                  <span className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 size={16} />
                    Saved locally
                  </span>
                )}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="text-accent" size={22} />
                <div>
                  <h2 className="text-lg font-semibold text-heading">
                    Account security
                  </h2>
                  <p className="text-sm text-muted">
                    Authentication and authorization controls
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['Authentication', 'JWT Bearer access token'],
                  ['Authorization', 'Admin and SOC Analyst RBAC'],
                  ['Password storage', 'Server-side password hashing'],
                  ['Transport', 'HTTPS required for production'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm font-semibold text-heading">{value}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-muted">
                Password reset, refresh tokens, account lockout and token
                revocation are documented future improvements.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
