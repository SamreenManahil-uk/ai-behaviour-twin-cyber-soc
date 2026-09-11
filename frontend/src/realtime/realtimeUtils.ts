import type {
  AlertRealtimeMessage,
  RealtimeConnectionStatus,
  RealtimeNotice,
} from './realtimeTypes'

export function buildRealtimeNotice(
  eventName: 'created' | 'updated',
  message: AlertRealtimeMessage,
): RealtimeNotice {
  const action =
    eventName === 'created' ? 'New threat alert' : 'Alert status updated'

  return {
    id: `${message.alertId}-${eventName}-${message.occurredAtUtc}`,
    heading: action,
    detail: `${message.title} · Risk ${message.riskScore}/100`,
    severity: message.severity,
    alertId: message.alertId,
  }
}

export function realtimeStatusLabel(
  status: RealtimeConnectionStatus,
  isDemo: boolean,
) {
  if (isDemo) {
    return 'Demo mode · Realtime paused'
  }

  if (status === 'connected') {
    return 'Live alerts connected'
  }

  if (status === 'reconnecting') {
    return 'Reconnecting live alerts'
  }

  if (status === 'disconnected') {
    return 'Live alerts offline'
  }

  return 'Live alerts unavailable'
}
