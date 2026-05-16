import { create } from 'zustand'

const THEME_KEY = 'theme-preference'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  initialize: () => void
}

function getInitialPreference(): boolean {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored !== null) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  initialize: () => {
    const isDark = getInitialPreference()
    applyTheme(isDark)
    set({ isDark })
  },

  toggle: () => {
    const next = !get().isDark
    applyTheme(next)
    set({ isDark: next })
  },
}))
