import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Unable to load security data',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="soc-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-critical/10 text-critical">
        <TriangleAlert size={27} />
      </div>
      <h3 className="soc-value mt-5 text-lg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-6"
          leftIcon={<RotateCcw size={16} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
