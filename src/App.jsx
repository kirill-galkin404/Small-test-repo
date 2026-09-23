import { useEffect, useState } from 'react'
import Counter from './Counter.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function App() {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

  return (
    <>
      <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <Counter />
    </>
  )
}
