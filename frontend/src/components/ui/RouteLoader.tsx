export function RouteLoader() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading page...</span>

      <div className="h-4 w-32 animate-pulse rounded bg-surface-strong" />
      <div className="h-10 w-72 max-w-full animate-pulse rounded-lg bg-surface-strong" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="soc-card h-32 animate-pulse bg-surface-strong/50"
          />
        ))}
      </div>

      <div className="soc-card h-80 animate-pulse bg-surface-strong/50" />
    </div>
  )
}
