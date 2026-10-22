import { useTheme } from './theme.js';

export default function ThemeToggle() {
  const [theme, toggle] = useTheme();

  return (
    <button type="button" className="theme-toggle" aria-pressed={theme === 'dark'} onClick={toggle}>
      Dark mode
    </button>
  );
}
