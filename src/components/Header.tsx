import type { Theme, TimeWindow } from '../types/quadrant'
import { formatHours } from '../utils/hoursCalculator'

type HeaderProps = {
  title: string
  theme: Theme
  onToggleTheme: () => void
  timeWindow?: TimeWindow
  onFinalizePlan?: () => void
}

const Header = ({ title, theme, onToggleTheme, timeWindow, onFinalizePlan }: HeaderProps) => {
  const isDark = theme === 'dark'
  const icon = isDark ? '☀️' : '🌙'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  const allocatedHours = timeWindow?.allocatedHours || 0
  const totalHours = timeWindow?.totalHours || 56
  const progressPercentage = totalHours > 0 ? (allocatedHours / totalHours) * 100 : 0
  
  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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
            <div className="progress-bar-container">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  aria-valuenow={allocatedHours}
                  aria-valuemin={0}
                  aria-valuemax={totalHours}
                  role="progressbar"
                />
              </div>
              <div className="progress-text">
                {formatHours(allocatedHours)} / {formatHours(totalHours)}
              </div>
            </div>
            <div className="hours-info">
              <span className="hours-total">• Ends {formatEndDate(timeWindow.endDate)}</span>
              {onFinalizePlan && (
                <button 
                  type="button" 
                  className="btn-finalize"
                  onClick={onFinalizePlan}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Show Calendar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
