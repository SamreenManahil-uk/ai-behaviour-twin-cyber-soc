import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  primaryNavigation,
  secondaryNavigation,
  type NavigationItem,
} from '../../config/navigation'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

interface NavigationGroupProps {
  title: string
  items: NavigationItem[]
  collapsed: boolean
  onNavigate: () => void
}

function NavigationGroup({
  title,
  items,
  collapsed,
  onNavigate,
}: NavigationGroupProps) {
  return (
    <div className="mb-7">
      {!collapsed && (
        <p className="soc-label mb-3 px-3 text-[0.625rem]">{title}</p>
      )}

      <nav className="space-y-1" aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'group relative flex min-h-11 items-center rounded-xl px-3',
                  'text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center' : 'gap-3',
                  isActive
                    ? 'bg-brand-400/10 text-brand-300'
                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="shrink-0"
                    aria-hidden="true"
                  />

                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'border-r border-[var(--border)] bg-[var(--background-elevated)]/95',
          'shadow-2xl backdrop-blur-xl transition-all duration-300',
          collapsed ? 'lg:w-20' : 'lg:w-72',
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-20 items-center border-b border-[var(--border)] px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300">
              <ShieldCheck size={25} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--background-elevated)] bg-healthy" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-wide">
                  Behaviour-Twin
                </p>
                <p className="soc-label mt-1 !text-[0.55rem] !text-brand-400">
                  Cyber SOC
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavigationGroup
            title="Security operations"
            items={primaryNavigation}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />

          <NavigationGroup
            title="Platform"
            items={secondaryNavigation}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />
        </div>

        <div className="border-t border-[var(--border)] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-healthy">
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-healthy" />
                SOC workspace active
              </div>
              <p className="mt-2 text-[0.68rem] leading-5 text-[var(--foreground-muted)]">
                Open System Health for live service status.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={[
              'flex min-h-11 w-full items-center rounded-xl px-3',
              'text-sm font-medium text-[var(--foreground-secondary)]',
              'hover:bg-red-400/10 hover:text-red-400',
              collapsed ? 'justify-center' : 'gap-3',
            ].join(' ')}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={19} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-solid)] text-[var(--foreground-muted)] shadow-lg hover:border-brand-400/40 hover:text-brand-400 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>
      </aside>
    </>
  )
}
