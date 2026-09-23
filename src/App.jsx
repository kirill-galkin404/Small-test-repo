import { useEffect, useState } from 'react'
import Counter from './Counter.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function prefersDark() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [theme, setTheme] = useState(null)
  const [osDark, setOsDark] = useState(prefersDark)
  const effectiveTheme = theme ?? (osDark ? 'dark' : 'light')

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => setOsDark(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

  return (
    <>
      <ThemeToggle theme={effectiveTheme} onToggle={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')} />
      <Counter />
    </>
  )
}
