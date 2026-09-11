import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-4 sm:flex-row">
      <p className="text-xs text-[var(--foreground-muted)]">
        Showing{' '}
        <span className="font-semibold text-[var(--foreground)]">
          {firstItem}–{lastItem}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-[var(--foreground)]">
          {totalItems}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          leftIcon={<ChevronLeft size={15} />}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="technical-value min-w-20 text-center text-xs text-[var(--foreground-secondary)]">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          rightIcon={<ChevronRight size={15} />}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
