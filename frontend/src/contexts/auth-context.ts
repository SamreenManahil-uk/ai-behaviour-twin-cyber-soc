import { createContext } from 'react'
import type {
  AuthUser,
  LoginCredentials,
  UserRole,
} from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isAuthenticating: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  loginDemo: (role: UserRole) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
