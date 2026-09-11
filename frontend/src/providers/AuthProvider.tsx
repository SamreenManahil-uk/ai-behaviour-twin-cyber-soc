import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext } from '../contexts/auth-context'
import {
  requestCurrentUser,
  requestLogin,
} from '../services/authService'
import { ACCESS_TOKEN_KEY } from '../services/apiClient'
import type {
  AuthUser,
  LoginCredentials,
  UserRole,
} from '../types/auth'

const USER_KEY = 'cyber-soc-user'

interface AuthProviderProps {
  children: ReactNode
}

function readStoredUser(): AuthUser | null {
  const rawUser = window.sessionStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    const user = JSON.parse(rawUser) as AuthUser

    if (
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      (user.role === 'Admin' || user.role === 'SocAnalyst')
    ) {
      return user
    }
  } catch {
    window.sessionStorage.removeItem(USER_KEY)
  }

  return null
}

function storeUser(user: AuthUser) {
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    window.sessionStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('cyber-soc-session-expired', logout)

    return () => {
      window.removeEventListener('cyber-soc-session-expired', logout)
    }
  }, [logout])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsAuthenticating(true)

    try {
      const loginResponse = await requestLogin(credentials)

      if (!loginResponse.accessToken) {
        throw new Error('The API returned no access token.')
      }

      window.sessionStorage.setItem(
        ACCESS_TOKEN_KEY,
        loginResponse.accessToken,
      )

      const authenticatedUser =
        loginResponse.user ?? (await requestCurrentUser())

      storeUser(authenticatedUser)
      setUser(authenticatedUser)
    } catch (error) {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      window.sessionStorage.removeItem(USER_KEY)
      setUser(null)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const loginDemo = useCallback((role: UserRole) => {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)

    const demoUser: AuthUser = {
      id: `demo-${role.toLowerCase()}`,
      email:
        role === 'Admin'
          ? 'admin.demo@cybersoc.local'
          : 'analyst.demo@cybersoc.local',
      role,
      isActive: true,
    }

    storeUser(demoUser)
    setUser(demoUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAuthenticating,
      login,
      loginDemo,
      logout,
    }),
    [user, isAuthenticating, login, loginDemo, logout],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
