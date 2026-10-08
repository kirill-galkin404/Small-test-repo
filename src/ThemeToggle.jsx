import { useTheme } from './useTheme.js'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${next} theme`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? 'Light theme' : 'Dark theme'}
    </button>
  )
}
