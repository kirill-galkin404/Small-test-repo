export default function ThemeToggle({ theme, onToggle }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button type="button" onClick={onToggle}>
      Switch to {nextTheme} theme
    </button>
  )
}
