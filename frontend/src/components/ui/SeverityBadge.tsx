import { Badge } from './Badge'

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

interface SeverityBadgeProps {
  severity: Severity
}

const severityVariants = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'warning',
  Low: 'info',
  Info: 'neutral',
} as const

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge variant={severityVariants[severity]} dot>
      {severity}
    </Badge>
  )
}
