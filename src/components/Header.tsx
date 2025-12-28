import type { Theme, TimeWindow } from '../types/quadrant'
import { formatHours } from '../utils/hoursCalculator'
import Tooltip from './Tooltip'

type HeaderProps = {
  title: string
  theme: Theme
  onToggleTheme: () => void
  timeWindow?: TimeWindow
  onFinalizePlan?: () => void
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  currentWeekLabel?: string
  onCopyWeek?: () => void
  onPasteWeek?: () => void
  canCopyWeek?: boolean
  canPasteWeek?: boolean
}

const Header = ({ title, theme, onToggleTheme, timeWindow, onFinalizePlan, onPreviousWeek, onNextWeek, canGoPrevious, canGoNext, currentWeekLabel, onCopyWeek, onPasteWeek, canCopyWeek, canPasteWeek }: HeaderProps) => {
  const isDark = theme === 'dark'
  const icon = isDark ? '☀️' : '🌙'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  const allocatedHours = timeWindow?.allocatedHours || 0
  const totalHours = timeWindow?.totalHours || 56
  const progressPercentage = totalHours > 0 ? (allocatedHours / totalHours) * 100 : 0
  
  const formatDateRange = (startString: string, endString: string) => {
    const start = new Date(startString)
    const end = new Date(endString)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    if (startDay === endDay) {
      return `${startMonth} ${startDay}`
    }
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
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
            <div className="progress-bar-container" style={{ marginTop: '0.75rem' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {onPreviousWeek && onNextWeek && (
                  <>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={onPreviousWeek}
                      disabled={!canGoPrevious}
                      aria-label="Previous week"
                      style={{ opacity: canGoPrevious ? 1 : 0.3, cursor: canGoPrevious ? 'pointer' : 'not-allowed' }}
                    >
                      ←
                    </button>
                    <span className="hours-total" style={{ minWidth: '100px', textAlign: 'center' }}>
                      {currentWeekLabel || formatDateRange(timeWindow.startDate, timeWindow.endDate)}
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={onNextWeek}
                      disabled={!canGoNext}
                      aria-label="Next week"
                      style={{ opacity: canGoNext ? 1 : 0.3, cursor: canGoNext ? 'pointer' : 'not-allowed' }}
                    >
                      →
                    </button>
                  </>
                )}
                {(!onPreviousWeek || !onNextWeek) && (
                  <span className="hours-total">• Ends {formatDateRange(timeWindow.startDate, timeWindow.endDate)}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onCopyWeek && (
                  <Tooltip content={[canCopyWeek ? 'Copy all tasks from this week' : 'No tasks to copy']} show={true}>
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onCopyWeek}
                      disabled={!canCopyWeek}
                      style={{ opacity: canCopyWeek ? 1 : 0.5, cursor: canCopyWeek ? 'pointer' : 'not-allowed' }}
                      aria-label={canCopyWeek ? 'Copy all tasks from this week' : 'No tasks to copy'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
                {onPasteWeek && (
                  <Tooltip content={['Paste tasks to this week']} show={canPasteWeek}>
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onPasteWeek}
                      disabled={!canPasteWeek}
                      style={{ opacity: canPasteWeek ? 1 : 0.5, cursor: canPasteWeek ? 'pointer' : 'not-allowed' }}
                      aria-label={canPasteWeek ? 'Paste tasks to this week' : 'Copy a week first'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
                {onFinalizePlan && (
                  <Tooltip content={['Show calendar']} show={true}>
                    <button 
                      type="button" 
                      className="btn-finalize"
                      onClick={onFinalizePlan}
                      aria-label="Show calendar"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
