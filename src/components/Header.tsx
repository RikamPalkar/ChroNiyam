import type { Theme } from '../types/quadrant'

type HeaderProps = {
  title: string
  theme: Theme
  onToggleTheme: () => void
}

const Header = ({ title, theme, onToggleTheme }: HeaderProps) => {
  const isDark = theme === 'dark'
  const icon = isDark ? '☀️' : '🌙'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <header className="matrix-nav" aria-label="Application header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          CN
        </span>
        <div>
          <p className="brand-title">{title}</p>
          <p className="brand-subtitle">Time matrix</p>
        </div>
      </div>
      <div className="theme-toggle-wrapper">
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          aria-label={label}
        >
          <span className="theme-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="theme-label">{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
