import {
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { allNavigation } from '../../config/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

const notifications = [
  {
    title: 'Critical alert detected',
    detail: 'Encoded PowerShell on WIN-EMP-042',
    time: '2 min ago',
    colour: 'bg-critical',
  },
  {
    title: 'Incident status updated',
    detail: 'INC-2026-019 moved to Investigating',
    time: '14 min ago',
    colour: 'bg-medium',
  },
  {
    title: 'Endpoint recovered',
    detail: 'LNX-SRV-009 is reporting normally',
    time: '32 min ago',
    colour: 'bg-healthy',
  },
]

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const currentItem = allNavigation.find((item) => {
    if (item.path === '/') {
      return location.pathname === '/'
    }

    return location.pathname.startsWith(item.path)
  })

  const currentLabel = currentItem?.label ?? 'Cyber SOC'
  const roleLabel = user?.role === 'Admin' ? 'Administrator' : 'SOC Analyst'
  const initials = user?.role === 'Admin' ? 'AD' : 'SA'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        setProfileOpen(false)
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl"
    >
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2.5 text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <Link to="/" className="hover:text-brand-400">
              Cyber SOC
            </Link>
            <span>/</span>
            <span className="truncate text-[var(--foreground-secondary)]">
              {currentLabel}
            </span>
          </div>

          <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">
            {currentLabel}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div
            className={[
              'hidden items-center overflow-hidden rounded-xl border',
              'border-[var(--border)] bg-[var(--surface)] transition-all md:flex',
              searchOpen ? 'w-72 border-brand-400/30' : 'w-52 xl:w-72',
            ].join(' ')}
          >
            <Search
              size={17}
              className="ml-3 shrink-0 text-[var(--foreground-muted)]"
            />
            <input
              type="search"
              placeholder="Search alerts, endpoints..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)]"
              aria-label="Global search"
            />
            <kbd className="mr-3 hidden rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.65rem] text-[var(--foreground-muted)] xl:block">
              ⌘ K
            </kbd>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:border-brand-400/30 hover:text-brand-400"
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open)
                setProfileOpen(false)
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:border-brand-400/30 hover:text-brand-400"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--surface-solid)] bg-critical" />
            </button>

            {notificationsOpen && (
              <div className="soc-panel absolute right-0 top-14 w-[min(22rem,calc(100vw-2rem))] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Notifications</p>
                    <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                      3 unread updates
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.title}
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-[var(--surface-hover)]"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.colour}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {notification.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-[var(--foreground-secondary)]">
                          {notification.detail}
                        </span>
                        <span className="mt-1 block text-[0.65rem] text-[var(--foreground-muted)]">
                          {notification.time}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full border-t border-[var(--border)] px-4 py-3 text-sm font-semibold text-brand-400 hover:bg-brand-400/5"
                >
                  View all activity
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open)
                setNotificationsOpen(false)
              }}
              className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 hover:border-brand-400/30"
              aria-label="Open analyst profile"
              aria-expanded={profileOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-300 to-indigo-500 text-xs font-bold text-slate-950">
                {initials}
              </span>

              <span className="hidden text-left xl:block">
                <span className="block text-xs font-semibold">
                  {roleLabel}
                </span>
                <span className="block text-[0.625rem] text-healthy">
                  Active shift
                </span>
              </span>

              <ChevronDown
                size={14}
                className="hidden text-[var(--foreground-muted)] xl:block"
              />
            </button>

            {profileOpen && (
              <div className="soc-panel absolute right-0 top-14 w-56 overflow-hidden p-2">
                <div className="border-b border-[var(--border)] px-3 py-3">
                  <p className="text-sm font-semibold">{roleLabel}</p>
                  <p className="mt-1 truncate text-xs text-[var(--foreground-muted)]">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  <UserRound size={16} />
                  Profile settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-critical hover:bg-critical/5"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
