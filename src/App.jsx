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
  const effectiveTheme = theme ?? (prefersDark() ? 'dark' : 'light')

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
