import type { PageQuery, PageResponse } from '../types/api'
import { apiClient } from './apiClient'

export interface ApiEndpoint {
  id: string
  hostname: string
  operatingSystem: string
  status: string
  lastSeenAtUtc?: string | null
  createdAtUtc: string
  updatedAtUtc: string
}

export interface ApiSecurityEvent {
  id: string
  endpointId: string
  eventType: string
  severity: string
  source: string
  occurredAtUtc: string
  rawPayload: string
  ingestedAtUtc: string
}

export interface ApiAlert {
  id: string
  securityEventId: string
  endpointId: string
  title: string
  description: string
  severity: string
  status: string
  riskScore: number
  detectionSource: string
  mitreTechniqueId?: string | null
  mitreTechniqueName?: string | null
  createdAtUtc: string
  updatedAtUtc: string
}

export interface ApiIncident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  assignedUserId?: string | null
  createdAtUtc: string
  updatedAtUtc: string
  resolvedAtUtc?: string | null
}

export interface ApiThreat {
  id: string
  indicatorType: string
  indicatorValue: string
  threatName: string
  description?: string | null
  confidenceScore: number
  source: string
  isActive: boolean
  firstSeenAtUtc: string
  lastSeenAtUtc: string
  createdAtUtc: string
}

export async function getEndpoints(query: PageQuery = {}) {
  const response = await apiClient.get<PageResponse<ApiEndpoint>>(
    '/endpoints',
    { params: query },
  )
  return response.data
}

export async function getSecurityEvents(query: PageQuery = {}) {
  const response = await apiClient.get<PageResponse<ApiSecurityEvent>>(
    '/security-events',
    { params: query },
  )
  return response.data
}

export async function getAlerts(query: PageQuery = {}) {
  const response = await apiClient.get<PageResponse<ApiAlert>>('/alerts', {
    params: query,
  })
  return response.data
}

export async function getIncidents(query: PageQuery = {}) {
  const response = await apiClient.get<PageResponse<ApiIncident>>(
    '/incidents',
    { params: query },
  )
  return response.data
}

export async function getThreats(query: PageQuery = {}) {
  const response = await apiClient.get<PageResponse<ApiThreat>>('/threats', {
    params: query,
  })
  return response.data
}

export async function predictNetwork(
  features: Record<string, string | number>,
) {
  const response = await apiClient.post('/predict', { features })
  return response.data
}
