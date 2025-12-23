import type { Task } from '../types/quadrant'

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  return (
    <div 
      className="task-card" 
      title={task.description || undefined}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-main">
        <p className="task-title">{task.title}</p>
      </div>
      <div className="task-actions">
        <button type="button" className="icon-btn" aria-label="Edit task" onClick={() => onEdit(task)}>
          ✎
        </button>
        <button type="button" className="icon-btn" aria-label="Delete task" onClick={() => onDelete(task.id)}>
          🗑️
        </button>
      </div>
    </div>
  )
}

export default TaskCard
