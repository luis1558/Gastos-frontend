import { create } from 'zustand'
import type { User } from '../types/models'
import type { TokenPair } from '../types/api'

const REFRESH_TOKEN_KEY = 'refresh_token'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setAuth: (user: User, tokens: TokenPair) => void
  logout: () => void
  refreshSession: () => Promise<boolean>
  initialize: () => void
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function setStoredRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, tokens) => {
    setStoredRefreshToken(tokens.refresh_token)
    set({
      user,
      accessToken: tokens.access_token,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  logout: () => {
    setStoredRefreshToken(null)
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  refreshSession: async () => {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      get().logout()
      return false
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) {
        get().logout()
        return false
      }

      const tokens = await res.json()
      setStoredRefreshToken(tokens.refresh_token)
      set({ accessToken: tokens.access_token })

      const userRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userRes.ok) {
        const user = await userRes.json()
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }

      return true
    } catch {
      get().logout()
      return false
    }
  },

  initialize: async () => {
    set({ isLoading: true })
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    await get().refreshSession()
  },
}))
