import { useAuthStore } from '../stores/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface RequestConfig {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private buildUrl(path: string, params?: RequestConfig['params']): string {
    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private async getAccessToken(): Promise<string | null> {
    const state = useAuthStore.getState()
    if (state.accessToken) return state.accessToken

    const refreshed = await state.refreshSession()
    if (refreshed) return useAuthStore.getState().accessToken
    return null
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw error
    }
    return response.json() as Promise<T>
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const token = await this.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = this.buildUrl(path, config.params)
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    })

    if (response.status === 401 && token) {
      const refreshed = await useAuthStore.getState().refreshSession()
      if (refreshed) {
        const newToken = useAuthStore.getState().accessToken
        headers['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(url, {
          method: config.method || 'GET',
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
        })
        return this.handleResponse<T>(retryResponse)
      }
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('Session expired')
    }

    return this.handleResponse<T>(response)
  }

  get<T>(path: string, params?: RequestConfig['params']): Promise<T> {
    return this.request<T>(path, { params })
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body })
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body })
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_BASE)
