import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import {
  useState,
  type FormEvent,
} from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/apiClient'
import type { UserRole } from '../types/auth'

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const {
    isAuthenticated,
    isAuthenticating,
    login,
    loginDemo,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')

  const destination =
    (location.state as LoginLocationState | null)?.from ?? '/'

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    try {
      await login({
        email: email.trim(),
        password,
      })
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(
        getApiErrorMessage(
          loginError,
          'Sign-in failed. Check your credentials and try again.',
        ),
      )
    }
  }

  function enterDemo(role: UserRole) {
    loginDemo(role)
    navigate(destination, { replace: true })
  }

  return (
    <main className="soc-grid-background grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[#050b12] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300">
            <ShieldCheck size={27} />
          </div>
          <div>
            <p className="font-bold">AI Behaviour-Twin</p>
            <p className="soc-label mt-1 !text-brand-400">Cyber SOC</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="soc-label !text-brand-400">Secure analyst access</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight xl:text-5xl">
            Intelligence-led security operations.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Monitor security events, investigate AI-prioritised threats and
            coordinate incident response from one unified workspace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ['2', 'ML models'],
              ['24/7', 'Monitoring'],
              ['RBAC', 'Access'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="technical-value text-xl font-bold text-brand-300">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          Portfolio prototype · Simulated endpoint response actions
        </p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <ShieldCheck className="text-brand-400" size={28} />
            <span className="font-bold">AI Behaviour-Twin Cyber SOC</span>
          </div>

          <p className="soc-label text-brand-400">Welcome back</p>
          <h2 className="soc-value mt-3 text-3xl">Sign in to your SOC</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-secondary)]">
            Use an authorised ASP.NET account or enter the safe UI demo.
          </p>

          <form onSubmit={submitLogin} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Email address
              </span>
              <span className="flex h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 focus-within:border-brand-400/50">
                <Mail
                  size={18}
                  className="text-[var(--foreground-muted)]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  autoComplete="email"
                  placeholder="analyst@example.com"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[var(--foreground-muted)]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <span className="flex h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 focus-within:border-brand-400/50">
                <LockKeyhole
                  size={18}
                  className="text-[var(--foreground-muted)]"
                />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[var(--foreground-muted)]"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="rounded-lg p-1 text-[var(--foreground-muted)] hover:text-brand-400"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  {passwordVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-critical/20 bg-critical/10 p-3 text-xs leading-5 text-critical"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={isAuthenticating}
              className="w-full"
            >
              Secure sign in
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="soc-label !text-[0.55rem]">Portfolio demo</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              leftIcon={<Users size={16} />}
              onClick={() => enterDemo('SocAnalyst')}
            >
              Analyst demo
            </Button>
            <Button
              variant="outline"
              leftIcon={<UserCog size={16} />}
              onClick={() => enterDemo('Admin')}
            >
              Admin demo
            </Button>
          </div>

          <p className="mt-6 text-center text-[0.6875rem] leading-5 text-[var(--foreground-muted)]">
            Demo access creates no JWT and contacts no database. It is only for
            reviewing the frontend until an authorised user is provisioned.
          </p>
        </div>
      </section>
    </main>
  )
}
