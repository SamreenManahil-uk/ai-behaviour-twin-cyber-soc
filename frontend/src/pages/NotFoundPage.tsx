import { ArrowLeft, Radar } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="soc-grid-background flex min-h-screen items-center justify-center p-6">
      <div className="soc-panel max-w-lg p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-400">
          <Radar size={31} />
        </div>
        <p className="technical-value mt-7 text-sm font-semibold text-brand-400">
          HTTP 404
        </p>
        <h1 className="soc-value mt-3 text-3xl">Signal not found</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-secondary)]">
          The requested SOC workspace does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-400 px-4 text-sm font-bold text-slate-950 hover:bg-brand-300"
        >
          <ArrowLeft size={16} />
          Return to SOC overview
        </Link>
      </div>
    </main>
  )
}
