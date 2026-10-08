import { useCallback, useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'theme'

function isTheme(value) {
  return value === 'light' || value === 'dark'
}

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

function systemTheme() {
  if (typeof window.matchMedia !== 'function') return 'light'
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // storage unavailable: the choice simply lasts for this page view
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme() ?? systemTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    storeTheme(next)
    setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}
