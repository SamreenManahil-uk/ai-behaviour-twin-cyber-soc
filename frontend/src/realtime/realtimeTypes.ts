export type RealtimeConnectionStatus =
  | 'disabled'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export type RealtimeSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'informational'

export interface AlertRealtimeMessage {
  alertId: string
  endpointId: string
  title: string
  severity: RealtimeSeverity
  status: string
  riskScore: number
  detectionSource: string
  mitreTechniqueId?: string | null
  occurredAtUtc: string
}

export interface RealtimeNotice {
  id: string
  heading: string
  detail: string
  severity: RealtimeSeverity
  alertId: string
}
