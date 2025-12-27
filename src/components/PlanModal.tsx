import { useState } from 'react'
import type { TimeWindow } from '../types/quadrant'

type PlanModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (timeWindow: TimeWindow) => void
  currentPlan?: TimeWindow
}

const PlanModal = ({ isOpen, onClose, onSave, currentPlan }: PlanModalProps) => {
  const [windowType, setWindowType] = useState<'week' | 'month' | 'custom'>('week')
  const [startTomorrow, setStartTomorrow] = useState(false)
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  })
  const [hoursPerDay, setHoursPerDay] = useState(currentPlan?.hoursPerDay || 8)

  if (!isOpen) return null

  const getStartDate = () => {
    const today = new Date()
    if (startTomorrow) {
      today.setDate(today.getDate() + 1)
    }
    return today.toISOString().split('T')[0]
  }

  const getDays = () => {
    if (windowType === 'week') return 7
    if (windowType === 'month') return 30
    
    // For custom, calculate days between start and end date (inclusive)
    const start = new Date(getStartDate())
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, Math.min(30, diffDays))
  }

  const getEndDate = () => {
    if (windowType === 'custom') {
      return endDate
    }
    const start = new Date(getStartDate())
    start.setDate(start.getDate() + getDays() - 1)
    return start.toISOString().split('T')[0]
  }

  const days = getDays()
  const totalHours = days * hoursPerDay
  const startDateStr = getStartDate()
  const endDateStr = getEndDate()

  const handleSave = () => {
    const plan: TimeWindow = {
      startDate: startDateStr,
      endDate: endDateStr,
      days,
      hoursPerDay,
      totalHours,
      allocatedHours: currentPlan?.allocatedHours || 0,
    }
    onSave(plan)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal plan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Plan Your Time Window</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-form">
          <div className="field">
            <label className="field-label">Duration</label>
            <div className="window-type-selector">
              <button
                type="button"
                className={`btn ${windowType === 'week' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('week')}
                title="7 day time window"
              >
                Week
              </button>
              <button
                type="button"
                className={`btn ${windowType === 'month' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('month')}
                title="30 day time window"
              >
                Month
              </button>
              <button
                type="button"
                className={`btn ${windowType === 'custom' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('custom')}
                title="Custom date range"
              >
                Custom
              </button>
            </div>
          </div>

          <div className="field-row plan-date-row">
            <div className="field">
              <label className="field-label">Start Date</label>
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-option ${!startTomorrow ? 'active' : ''}`}
                  onClick={() => setStartTomorrow(false)}
                  title="Start planning from today"
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`toggle-option ${startTomorrow ? 'active' : ''}`}
                  onClick={() => setStartTomorrow(true)}
                  title="Start planning from tomorrow"
                >
                  Tomorrow
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Daily Hours</label>
              <input
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, parseInt(e.target.value) || 8)))}
              />
            </div>

            {windowType === 'custom' ? (
              <div className="field">
                <label className="field-label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={(() => {
                    const minDate = new Date(getStartDate())
                    minDate.setDate(minDate.getDate() + 1)
                    return minDate.toISOString().split('T')[0]
                  })()}
                />
              </div>
            ) : (
              <div className="field field-spacer"></div>
            )}
          </div>

          <div className="plan-summary">
            <div className="summary-inline">
              <span className="summary-part">
                <span className="summary-label">Starts</span>
                <span className="summary-value start-date">{startTomorrow ? 'Tomorrow' : 'Today'}</span>
              </span>
              <span className="summary-separator">•</span>
              <span className="summary-part">
                <span className="summary-label">{days} days</span>
                <span className="summary-value">× {hoursPerDay}h</span>
              </span>
              <span className="summary-separator">•</span>
              <span className="summary-part highlight">
                <span className="summary-value">{totalHours}h total</span>
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn primary" onClick={handleSave} title="Save this time window plan">
            Save Plan
          </button>
          <button type="button" className="btn secondary" onClick={onClose} title="Cancel and close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanModal
