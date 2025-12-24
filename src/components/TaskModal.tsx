import { useState } from 'react'
import type { QuadrantKey, Task } from '../types/quadrant'

type TaskModalProps = {
  isOpen: boolean
  quadrants: QuadrantKey[]
  onClose: () => void
  onSave: (task: TaskInput) => void
  initialTask?: Task
  timeWindow?: { startDate: string; endDate: string; hoursPerDay: number; totalHours: number; allocatedHours: number }
  allTasks?: Task[]
}

export type TaskInput = {
  id?: string
  title: string
  description?: string
  quadrant: QuadrantKey
  estimatedHours: number
  startDate: string
  dueDate: string
  completed: boolean
}

const TaskModal = ({ isOpen, quadrants, onClose, onSave, initialTask, timeWindow, allTasks = [] }: TaskModalProps) => {
  const getDefaultDueDate = () => {
    if (timeWindow) return timeWindow.startDate
    return new Date().toISOString().split('T')[0]
  }

  const emptyTask: TaskInput = {
    title: '',
    description: '',
    quadrant: quadrants[0],
    estimatedHours: 1,
    startDate: getDefaultDueDate(),
    dueDate: getDefaultDueDate(),
    completed: false,
  }
  
  const [draft, setDraft] = useState<TaskInput>(initialTask ?? emptyTask)
  const [error, setError] = useState<string>('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDayUsageSummary = (date: string) => {
    const tasksOnDay = allTasks.filter((t) => (t.startDate || t.dueDate) === date && t.id !== initialTask?.id)
    const used = tasksOnDay.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    const remaining = timeWindow ? Math.max(0, timeWindow.hoursPerDay - used) : Infinity
    return { used, remaining }
  }

  const { remaining: remainingForSelectedDay } = getDayUsageSummary(draft.startDate)
  const remainingHoursNumber = Number.isFinite(remainingForSelectedDay) ? remainingForSelectedDay : undefined

  const validateTask = (task: TaskInput): string => {
    // Start must be on/before due
    if (new Date(task.dueDate) < new Date(task.startDate)) {
      return 'Due date must be on or after the start date.'
    }

    if (timeWindow) {
      // Per-day capacity check
      const { used, remaining } = getDayUsageSummary(task.startDate)
      if (task.estimatedHours > remaining) {
        return `Daily limit ${timeWindow.hoursPerDay}h. ${used}h already scheduled. ${remaining}h left on ${formatDate(task.startDate)}.`
      }

      // Total window capacity check
      const otherTasksHours = allTasks
        .filter((t) => t.id !== initialTask?.id)
        .reduce((sum, t) => sum + t.estimatedHours, 0)
      const totalHoursWithNewTask = otherTasksHours + task.estimatedHours
      
      if (totalHoursWithNewTask > timeWindow.totalHours) {
        const remaining = Math.max(0, timeWindow.totalHours - otherTasksHours)
        return `Task exceeds total available hours. Only ${remaining}h remaining (needs ${task.estimatedHours}h).`
      }
    }

    return ''
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    
    const validationError = validateTask(draft)
    if (validationError) {
      setError(validationError)
      return
    }
    
    onSave({ ...draft, id: initialTask?.id })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add task">
      <div className="modal">
        <header className="modal-header">
          <h2>{initialTask ? 'Edit Task' : 'Add Task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <label className="field">
            <span className="field-label">Title *</span>
            <input
              name="title"
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter task title"
            />
          </label>

          <label className="field">
            <span className="field-label">Quadrant *</span>
            <select
              name="quadrant"
              value={draft.quadrant}
              onChange={(e) => setDraft({ ...draft, quadrant: e.target.value as QuadrantKey })}
            >
              {quadrants.map((quad) => (
                <option key={quad} value={quad}>
                  {quad}
                </option>
              ))}
            </select>
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Start Date *</span>
              <div className="field-with-hint">
                <input
                  type="date"
                  name="startDate"
                  required
                  value={draft.startDate}
                  onChange={(e) => {
                    const value = e.target.value
                    setDraft((prev) => ({
                      ...prev,
                      startDate: value,
                      dueDate: prev.dueDate < value ? value : prev.dueDate,
                    }))
                  }}
                  min={timeWindow?.startDate}
                  max={timeWindow?.endDate}
                />
                {timeWindow && remainingHoursNumber !== undefined && (
                  <span className="field-hint">This day has {remainingHoursNumber}h remaining</span>
                )}
              </div>
            </label>

            <label className="field">
              <span className="field-label">Due Date *</span>
              <input
                type="date"
                name="dueDate"
                required
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                min={draft.startDate}
                max={timeWindow?.endDate}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Estimated Hours *</span>
            <div className="field-with-hint">
              <input
                type="number"
                name="estimatedHours"
                required
                min="0.5"
                step="0.5"
                max={timeWindow && remainingHoursNumber !== undefined ? remainingHoursNumber : timeWindow?.hoursPerDay}
                value={draft.estimatedHours}
                onChange={(e) => {
                  e.currentTarget.setCustomValidity('')
                  setDraft({ ...draft, estimatedHours: parseFloat(e.target.value) || 1 })
                }}
                onInvalid={(e) => {
                  const el = e.currentTarget
                  if (timeWindow && remainingHoursNumber !== undefined) {
                    el.setCustomValidity(`Daily limit ${timeWindow.hoursPerDay}h. Only ${remainingHoursNumber}h left.`)
                  } else if (timeWindow) {
                    el.setCustomValidity(`Daily limit ${timeWindow.hoursPerDay}h.`)
                  } else {
                    el.setCustomValidity('Please enter a valid number of hours.')
                  }
                }}
              />
              {timeWindow && (
                <span className="field-hint error">
                  {remainingHoursNumber !== undefined
                    ? `${remainingHoursNumber}h left on ${formatDate(draft.startDate)}`
                    : `Daily limit: ${timeWindow.hoursPerDay}h`}
                </span>
              )}
            </div>
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn primary">
              {initialTask ? 'Save Task' : 'Add Task'}
            </button>
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
