import { useState } from 'react'
import type { QuadrantKey, Task } from '../types/quadrant'

type TaskModalProps = {
  isOpen: boolean
  quadrants: QuadrantKey[]
  onClose: () => void
  onSave: (task: TaskInput) => void
  initialTask?: Task
}

export type TaskInput = {
  id?: string
  title: string
  description?: string
  quadrant: QuadrantKey
}

const TaskModal = ({ isOpen, quadrants, onClose, onSave, initialTask }: TaskModalProps) => {
  const emptyTask: TaskInput = {
    title: '',
    description: '',
    quadrant: quadrants[0],
  }
  
  const [draft, setDraft] = useState<TaskInput>(initialTask ?? emptyTask)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    onSave({ ...draft, id: initialTask?.id })
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
            <span className="field-label">Description</span>
            <textarea
              name="description"
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
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
