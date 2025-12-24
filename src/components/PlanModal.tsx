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
          <h2 className="modal-title">Plan Your Time Window</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-form">
          <div className="field">
            <label className="field-label">Time Window</label>
            <div className="window-type-selector">
              <button
                type="button"
                className={`btn ${windowType === 'week' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('week')}
              >
                Week (7 days)
              </button>
              <button
                type="button"
                className={`btn ${windowType === 'month' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('month')}
              >
                Month (30 days)
              </button>
              <button
                type="button"
                className={`btn ${windowType === 'custom' ? 'primary' : 'secondary'}`}
                onClick={() => setWindowType('custom')}
              >
                Custom
              </button>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Start Date</label>
              <div className="start-date-toggle">
                <button
                  type="button"
                  className={`btn ${!startTomorrow ? 'primary' : 'secondary'}`}
                  onClick={() => setStartTomorrow(false)}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`btn ${startTomorrow ? 'primary' : 'secondary'}`}
                  onClick={() => setStartTomorrow(true)}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Hours/Day</label>
              <input
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, parseInt(e.target.value) || 8)))}
              />
            </div>
          </div>

          {windowType === 'custom' && (
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
          )}

          <div className="plan-summary">
            <div className="summary-inline">
              <span className="summary-part">
                <span className="summary-label">Start:</span>
                <span className="summary-value start-date">{startTomorrow ? 'Tomorrow' : 'Today'}</span>
              </span>
              <span className="summary-separator">|</span>
              {windowType === 'custom' && (
                <>
                  <span className="summary-part">
                    <span className="summary-label">Duration:</span>
                    <span className="summary-value">{days} days</span>
                  </span>
                  <span className="summary-separator">|</span>
                </>
              )}
              {(windowType === 'week' || windowType === 'month') && (
                <>
                  <span className="summary-part">
                    <span className="summary-label">Ends:</span>
                    <span className="summary-value">{new Date(endDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </span>
                  <span className="summary-separator">|</span>
                </>
              )}
              <span className="summary-part highlight">
                <span className="summary-label">Total Available Hours:</span>
                <span className="summary-value">{totalHours}h</span>
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleSave}>
            Save Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanModal
