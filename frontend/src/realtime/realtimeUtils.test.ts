import { describe, expect, it } from 'vitest'
import {
  buildRealtimeNotice,
  realtimeStatusLabel,
} from './realtimeUtils'
import type { AlertRealtimeMessage } from './realtimeTypes'

const message: AlertRealtimeMessage = {
  alertId: '11111111-1111-1111-1111-111111111111',
  endpointId: '22222222-2222-2222-2222-222222222222',
  title: 'Encoded PowerShell execution',
  severity: 'critical',
  status: 'investigating',
  riskScore: 96.25,
  detectionSource: 'hybrid',
  mitreTechniqueId: 'T1059.001',
  occurredAtUtc: '2026-09-11T20:00:00Z',
}

describe('realtime utilities', () => {
  it('builds a safe created-alert notification', () => {
    const notice = buildRealtimeNotice('created', message)

    expect(notice.heading).toBe('New threat alert')
    expect(notice.detail).toContain('Risk 96.25/100')
    expect(notice.alertId).toBe(message.alertId)
    expect(JSON.stringify(notice)).not.toContain('RawPayload')
  })

  it('distinguishes updated alerts', () => {
    const notice = buildRealtimeNotice('updated', message)

    expect(notice.heading).toBe('Alert status updated')
  })

  it('uses honest connection labels', () => {
    expect(realtimeStatusLabel('connected', false)).toBe(
      'Live alerts connected',
    )
    expect(realtimeStatusLabel('reconnecting', false)).toBe(
      'Reconnecting live alerts',
    )
    expect(realtimeStatusLabel('disconnected', false)).toBe(
      'Live alerts offline',
    )
    expect(realtimeStatusLabel('disabled', true)).toBe(
      'Demo mode · Realtime paused',
    )
  })
})
