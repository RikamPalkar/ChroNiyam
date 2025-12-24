import type { Theme, TimeWindow } from '../types/quadrant'

type HeaderProps = {
  title: string
  theme: Theme
  onToggleTheme: () => void
  timeWindow?: TimeWindow
}

const Header = ({ title, theme, onToggleTheme, timeWindow }: HeaderProps) => {
  const isDark = theme === 'dark'
  const icon = isDark ? '☀️' : '🌙'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  const remainingHours = timeWindow ? timeWindow.totalHours - timeWindow.allocatedHours : 0

  return (
    <header className="matrix-nav" aria-label="Application header">
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ChroNiyam Logo" className="brand-logo" />
        <div>
          <p className="brand-title">{title}</p>
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
      {timeWindow && (
        <div className="hours-tracker-container">
          <div className="hours-tracker">
            <span className="hours-remaining">{remainingHours}h</span>
            <span className="hours-label">remaining</span>
            <span className="hours-total">/ {timeWindow.totalHours}h</span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
