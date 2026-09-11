import { apiClient } from './apiClient'

export type SimulatedActionType =
  | 'isolateEndpoint'
  | 'blockIpAddress'
  | 'terminateProcess'
  | 'disableAccount'
  | 'collectForensics'

export interface CreateSimulatedResponseActionRequest {
  actionType: SimulatedActionType
  target?: string
  reason: string
}

export interface SimulatedResponseAction {
  id: string
  alertId: string
  endpointId: string
  requestedByUserId: string
  actionType: SimulatedActionType
  target: string
  reason: string
  status: 'simulatedCompleted'
  resultSummary: string
  isSimulation: true
  requestedAtUtc: string
  completedAtUtc: string
}

export async function getSimulatedResponseActions(alertId: string) {
  const response = await apiClient.get<SimulatedResponseAction[]>(
    `/alerts/${alertId}/response-actions`,
  )

  return response.data
}

export async function createSimulatedResponseAction(
  alertId: string,
  request: CreateSimulatedResponseActionRequest,
) {
  const response = await apiClient.post<SimulatedResponseAction>(
    `/alerts/${alertId}/response-actions`,
    request,
  )

  return response.data
}
