import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
}: SearchInputProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search
        size={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm outline-none transition placeholder:text-[var(--foreground-muted)] focus:border-brand-400/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </label>
  )
}
