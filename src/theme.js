import { useCallback, useEffect, useState } from 'react'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function getInitialTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  const query = window.matchMedia(DARK_QUERY)
  return query && query.matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  )

  return [theme, toggleTheme]
}
