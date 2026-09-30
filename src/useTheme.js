import { useEffect, useState } from 'react'

// Fixed localStorage key used to persist the user's explicit theme choice.
// Never read/write any other key, and never trust arbitrary localStorage
// content beyond this one fixed key (I-0004).
const STORAGE_KEY = 'kh-counter-theme'

// Only these two exact strings are ever trusted as a persisted preference.
// Anything else (missing key, corrupted value, unexpected content) is
// treated as "no explicit preference" so the OS `prefers-color-scheme`
// media query in theme.css keeps governing the theme.
function readPersistedTheme() {
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  return raw === 'light' || raw === 'dark' ? raw : null
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => readPersistedTheme())

  // On mount, best-effort apply the persisted valid preference immediately
  // so a reload keeps the previously chosen theme instead of flashing back
  // to the OS default. When there is no valid persisted preference, leave
  // the data-theme attribute unset so the @media rule applies.
  useEffect(() => {
    const persisted = readPersistedTheme()
    if (persisted) {
      document.documentElement.setAttribute('data-theme', persisted)
    }
  }, [])

  function setTheme(next) {
    if (next !== 'light' && next !== 'dark') {
      return
    }
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures (e.g. private browsing quota); the DOM
      // attribute was already updated so the theme still applies for
      // this session.
    }
    setThemeState(next)
  }

  return { theme, setTheme }
}
