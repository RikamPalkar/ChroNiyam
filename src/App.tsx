import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import QuadrantGrid from './components/QuadrantGrid'
import SideActions from './components/SideActions'
import TaskModal, { type TaskInput } from './components/TaskModal'
import ConfirmDialog from './components/ConfirmDialog'
import Footer from './components/Footer'
import type { Quadrant, QuadrantKey, Task, Theme } from './types/quadrant'

const quadrants: Quadrant[] = [
  {
    title: 'Do First',
    description: 'Urgent and Important',
    className: 'quadrant-urgent-important',
    tooltip: [
      'Crisis mode: Deadlines, emergencies, and pressing problems.',
      'Handle these immediately but work to minimize time here through better planning.',
    ],
  },
  {
    title: 'Schedule',
    description: 'Not Urgent but Important',
    className: 'quadrant-not-urgent-important',
    tooltip: [
      'Strategic zone: Planning, personal development, and relationship building.',
      'This is where you should spend most of your time for long-term success.',
    ],
  },
  {
    title: 'Delegate',
    description: 'Urgent but Not Important',
    className: 'quadrant-urgent-not-important',
    tooltip: [
      'Distraction zone: Interruptions, some calls and emails, other people\'s priorities.',
      'Learn to say no or delegate these tasks.',
    ],
  },
  {
    title: 'Eliminate',
    description: 'Not Urgent and Not Important',
    className: 'quadrant-not-urgent-not-important',
    tooltip: [
      'Time wasters: Busy work, excessive social media, and trivial tasks.',
      'Minimize or eliminate these activities entirely.',
    ],
  },
]

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme())
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [helpMode, setHelpMode] = useState(false)
  const [balanceMode, setBalanceMode] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const title = useMemo(() => 'ChroNiyam', [])
  const quadrantNames = useMemo<QuadrantKey[]>(() => quadrants.map((q) => q.title), [])

  const upsertTask = (input: TaskInput) => {
    const id = input.id ?? crypto.randomUUID()
    setTasks((prev) => {
      const exists = prev.some((task) => task.id === id)
      if (exists) {
        return prev.map((task) => (task.id === id ? { ...task, ...input, id } : task))
      }
      return [...prev, { ...input, id }]
    })
  }

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setEditingTask(undefined)
    setShowModal(false)
  }

  const handleAddClick = () => {
    setEditingTask(undefined)
    setShowModal(true)
  }

  const handleClearTasks = () => {
    setShowClearConfirm(true)
  }

  const handleConfirmClear = () => {
    setTasks([])
    setShowClearConfirm(false)
  }

  const handleCancelClear = () => {
    setShowClearConfirm(false)
  }

  const handleMoveTask = (taskId: string, newQuadrant: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, quadrant: newQuadrant } : task
      )
    )
  }

  return (
    <div className="app-shell">
      <Header title={title} theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <div className="layout">
        <SideActions 
          onAddTask={handleAddClick} 
          onClear={handleClearTasks} 
          hasTasks={tasks.length > 0}
          helpMode={helpMode}
          onToggleHelp={() => setHelpMode(!helpMode)}
          balanceMode={balanceMode}
          onToggleBalance={() => setBalanceMode(!balanceMode)}
        />
        <div className="matrix-main">
          <QuadrantGrid
            quadrants={quadrants}
            tasks={tasks}
            onEditTask={handleEdit}
            onDeleteTask={handleDelete}
            helpMode={helpMode}
            onMoveTask={handleMoveTask}
            balanceMode={balanceMode}
          />
        </div>
      </div>
      <Footer />
      <TaskModal
        key={`${editingTask?.id ?? 'new'}-${showModal}`}
        isOpen={showModal}
        quadrants={quadrantNames}
        onClose={handleCloseModal}
        onSave={upsertTask}
        initialTask={editingTask}
      />
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Tasks"
        message="Are you sure you want to delete all tasks? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </div>
  )
}

export default App
