import { useTheme } from './useTheme.js'

// Lets the user override the OS theme preference. Shows the theme that
// will be applied when clicked (i.e. the button label is the target
// theme, not the current one), and falls back to "system" wording when
// there is no explicit preference yet.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggle() {
    const current = theme ?? getSystemPreference()
    setTheme(current === 'dark' ? 'light' : 'dark')
  }

  const label =
    theme === 'dark'
      ? 'Switch to light theme'
      : theme === 'light'
        ? 'Switch to dark theme'
        : 'Toggle theme (following system)'

  return (
    <button type="button" data-action="TOGGLE_THEME" onClick={toggle}>
      {label}
    </button>
  )
}

function getSystemPreference() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
