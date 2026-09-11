import axios, { AxiosError } from 'axios'

export const ACCESS_TOKEN_KEY = 'cyber-soc-access-token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      window.sessionStorage.removeItem('cyber-soc-user')
      window.dispatchEvent(new Event('cyber-soc-session-expired'))
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(
  error: unknown,
  fallback = 'The request could not be completed.',
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          detail?: string
          title?: string
          errors?: Record<string, string[]>
        }
      | undefined

    if (data?.detail) {
      return data.detail
    }

    if (data?.errors) {
      const firstError = Object.values(data.errors).flat()[0]

      if (firstError) {
        return firstError
      }
    }

    if (data?.title) {
      return data.title
    }

    if (error.code === 'ECONNABORTED') {
      return 'The service took too long to respond.'
    }

    if (!error.response) {
      return 'The ASP.NET API is currently unavailable.'
    }
  }

  return fallback
}
