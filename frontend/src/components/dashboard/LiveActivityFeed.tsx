import { Radio } from 'lucide-react'
import { liveActivity } from '../../data/demoSocData'

export function LiveActivityFeed() {
  return (
    <article className="soc-panel p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="soc-label">Streaming events</p>
          <h3 className="soc-value mt-2 text-lg">Live activity</h3>
        </div>
        <Radio className="text-healthy" size={20} />
      </div>

      <div className="relative mt-6">
        <div className="absolute bottom-2 left-[0.3125rem] top-2 w-px bg-[var(--border)]" />

        <div className="space-y-5">
          {liveActivity.map((item) => (
            <div key={`${item.title}-${item.time}`} className="relative flex gap-4">
              <span
                className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-[var(--background-elevated)] ${item.colour}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 text-[0.625rem] text-[var(--foreground-muted)]">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--foreground-muted)]">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
