import { ArrowRight, Construction, type LucideIcon } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  eyebrow?: string
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  eyebrow = 'Security operations',
}: PagePlaceholderProps) {
  return (
    <section>
      <div className="mb-6">
        <p className="soc-label text-brand-400">{eyebrow}</p>
        <h2 className="soc-value mt-2 text-2xl sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-secondary)]">
          {description}
        </p>
      </div>

      <article className="soc-panel relative min-h-[26rem] overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(34,211,238,0.08),transparent_22rem)]" />

        <div className="relative flex min-h-[22rem] flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-400/10 text-brand-300 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <Icon size={30} />
          </div>

          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-medium/20 bg-medium/10 px-3 py-1 text-xs font-semibold text-medium">
            <Construction size={13} />
            Page foundation ready
          </span>

          <h3 className="soc-value text-xl">{title} workspace</h3>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--foreground-muted)]">
            The route, responsive shell and navigation are working. Professional
            data views and API integration will be added in the next steps.
          </p>

          <button
            type="button"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-400 px-4 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.14)] transition hover:bg-brand-300"
          >
            Explore workflow
            <ArrowRight size={16} />
          </button>
        </div>
      </article>
    </section>
  )
}
