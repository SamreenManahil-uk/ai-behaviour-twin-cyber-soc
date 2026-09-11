import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from '../types/auth'
import { apiClient } from './apiClient'

export async function requestLogin(credentials: LoginCredentials) {
  const response = await apiClient.post<LoginResponse>(
    '/auth/login',
    credentials,
  )

  return response.data
}

export async function requestCurrentUser() {
  const response = await apiClient.get<AuthUser>('/auth/me')
  return response.data
}
