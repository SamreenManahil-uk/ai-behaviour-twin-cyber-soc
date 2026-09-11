export type UserRole = 'Admin' | 'SocAnalyst'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType?: string
  expiresAtUtc?: string
  user?: AuthUser
}
