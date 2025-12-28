import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import QuadrantGrid from './components/QuadrantGrid'
import SideActions from './components/SideActions'
import TaskModal, { type TaskInput } from './components/TaskModal'
import ConfirmDialog from './components/ConfirmDialog'
import Footer from './components/Footer'
import PlanModal from './components/PlanModal'
import CalendarView from './components/CalendarView'
import GuideModal from './components/GuideModal'
import type { Quadrant, QuadrantKey, Task, Theme, TimeWindow } from './types/quadrant'
import { canAllocateHours } from './utils/hoursCalculator'

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
  const [weekPlans, setWeekPlans] = useState<TimeWindow[]>([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [copiedWeekTemplate, setCopiedWeekTemplate] = useState<Task[] | null>(null)
  const [copiedWeekIndex, setCopiedWeekIndex] = useState<number | null>(null)
  const [copiedTask, setCopiedTask] = useState<Task | null>(null)
  const [pasteError, setPasteError] = useState<string>('')

  // Sort weeks chronologically
  const sortedWeeks = useMemo(() => {
    return [...weekPlans].sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [weekPlans])

  const currentWeek = sortedWeeks[currentWeekIndex]
  const canGoPrevious = currentWeekIndex > 0
  const canGoNext = currentWeekIndex < sortedWeeks.length - 1

  // Get combined date range for calendar
  const combinedDateRange = useMemo(() => {
    if (sortedWeeks.length === 0) return { startDate: '', endDate: '' }
    return {
      startDate: sortedWeeks[0].startDate,
      endDate: sortedWeeks[sortedWeeks.length - 1].endDate,
    }
  }, [sortedWeeks])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const title = useMemo(() => 'Chroनियम', [])
  const quadrantNames = useMemo<QuadrantKey[]>(() => quadrants.map((q) => q.title), [])

  // Calculate allocated hours for current week only
  const allocatedHours = useMemo(() => {
    if (!currentWeek) return 0
    
    const weekStart = new Date(currentWeek.startDate)
    const weekEnd = new Date(currentWeek.endDate)
    
    return tasks.reduce((sum, task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      
      // Only count tasks that overlap with current week
      if (taskStart > weekEnd || taskEnd < weekStart) return sum
      
      if (task.isRecurring) {
        // For recurring tasks within the week
        const overlapStart = taskStart > weekStart ? taskStart : weekStart
        const overlapEnd = taskEnd < weekEnd ? taskEnd : weekEnd
        const daysDiff = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return sum + (task.estimatedHours * daysDiff)
      }
      return sum + task.estimatedHours
    }, 0)
  }, [tasks, currentWeek])

  // Create computed time window with updated allocated hours for current week
  const currentTimeWindow = useMemo(() => {
    if (!currentWeek) return undefined
    return { ...currentWeek, allocatedHours }
  }, [currentWeek, allocatedHours])

  // Filter tasks for current week
  const weekTasks = useMemo(() => {
    if (!currentWeek) return tasks
    
    const weekStart = new Date(currentWeek.startDate)
    const weekEnd = new Date(currentWeek.endDate)
    
    return tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      // Include task if it overlaps with current week
      return taskStart <= weekEnd && taskEnd >= weekStart
    })
  }, [tasks, currentWeek])

  const handleCopyWeek = () => {
    if (!currentWeek) return
    
    const currentWeekStart = new Date(currentWeek.startDate)
    const currentWeekEnd = new Date(currentWeek.endDate)
    
    // Get all tasks from current week
    const tasksThisWeek = tasks.filter((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      return taskStart <= currentWeekEnd && taskEnd >= currentWeekStart
    })
    
    // Store relative day offsets instead of absolute dates
    const templateTasks = tasksThisWeek.map((task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.dueDate)
      const startDayOffset = Math.floor((taskStart.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24))
      const endDayOffset = Math.floor((taskEnd.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...task,
        startDate: '', // Will be calculated on paste
        dueDate: '',   // Will be calculated on paste
        metadata: { startDayOffset, endDayOffset }, // Store relative offsets
      } as Task & { metadata: { startDayOffset: number; endDayOffset: number } }
    })
    
    setCopiedWeekTemplate(templateTasks as Task[])
    setCopiedWeekIndex(currentWeekIndex)
  }

  const handlePasteWeek = () => {
    if (!currentWeek || !copiedWeekTemplate) return
    
    const targetWeekStart = new Date(currentWeek.startDate)
    
    // Create new tasks with dates adjusted to target week
    const pastedTasks = copiedWeekTemplate.map((template: any) => {
      const newStartDate = new Date(targetWeekStart)
      newStartDate.setDate(newStartDate.getDate() + template.metadata.startDayOffset)
      
      const newDueDate = new Date(targetWeekStart)
      newDueDate.setDate(newDueDate.getDate() + template.metadata.endDayOffset)
      
      const { metadata, ...taskWithoutMetadata } = template
      
      return {
        ...taskWithoutMetadata,
        id: crypto.randomUUID(),
        startDate: newStartDate.toISOString().split('T')[0],
        dueDate: newDueDate.toISOString().split('T')[0],
        completed: false,
      }
    })
    
    setTasks((prev) => [...prev, ...pastedTasks])
  }

  // Check if we can copy/paste
  const canCopyWeek = !!currentWeek && weekTasks.length > 0
  const canPasteWeek = !!currentWeek && !!copiedWeekTemplate && copiedWeekIndex !== currentWeekIndex

  const handlePreviousWeek = () => {
    if (canGoPrevious) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  const handleNextWeek = () => {
    if (canGoNext) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  const currentWeekLabel = useMemo(() => {
    if (sortedWeeks.length <= 1) return undefined
    const week = sortedWeeks[currentWeekIndex]
    if (!week) return undefined
    
    const start = new Date(week.startDate)
    const end = new Date(week.endDate)
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    
    let dateRange = ''
    if (startDay === endDay) {
      dateRange = `${startMonth} ${startDay}`
    } else if (startMonth === endMonth) {
      dateRange = `${startMonth} ${startDay}–${endDay}`
    } else {
      dateRange = `${startMonth} ${startDay} – ${endMonth} ${endDay}`
    }
    
    return `Week ${currentWeekIndex + 1} of ${sortedWeeks.length} (${dateRange})`
  }, [sortedWeeks, currentWeekIndex])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const handlePlanUpdate = (plan: TimeWindow) => {
    setWeekPlans((prev) => {
      // Check if this week already exists
      const existingIndex = prev.findIndex(
        (w) => w.startDate === plan.startDate && w.endDate === plan.endDate
      )
      
      if (existingIndex >= 0) {
        // Update existing week
        const updated = [...prev]
        updated[existingIndex] = plan
        return updated
      } else {
        // Add new week
        const newPlans = [...prev, plan]
        // Set current index to the newly added week
        const sorted = [...newPlans].sort((a, b) => a.startDate.localeCompare(b.startDate))
        const newIndex = sorted.findIndex((w) => w.startDate === plan.startDate)
        setCurrentWeekIndex(newIndex)
        return newPlans
      }
    })
  }

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

  const handleCopyTask = (task: Task) => {
    setCopiedTask(task)
  }

  const handlePasteTask = (quadrant: string) => {
    if (!copiedTask || !currentWeek) return

    // Check if pasting this task would exceed daily capacity
    const validation = canAllocateHours(
      copiedTask.startDate,
      copiedTask.dueDate,
      copiedTask.estimatedHours,
      weekTasks,
      currentWeek
    )

    if (!validation.canAllocate) {
      setPasteError(
        `Cannot paste task: Not enough capacity. Need ${copiedTask.estimatedHours}h but only ${validation.totalAvailable}h available (shortfall: ${validation.shortfall}h).`
      )
      return
    }

    const newTask = {
      ...copiedTask,
      id: crypto.randomUUID(),
      quadrant,
    }
    setTasks((prev) => [...prev, newTask])
    setCopiedTask(null)
  }

  // Handle ESC key to cancel copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && copiedTask) {
        setCopiedTask(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copiedTask])

  return (
    <div className="app-shell">
      <Header 
        title={title} 
        theme={theme} 
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        timeWindow={currentTimeWindow}
        onFinalizePlan={() => setShowCalendar(true)}
        onPreviousWeek={sortedWeeks.length > 1 ? handlePreviousWeek : undefined}
        onNextWeek={sortedWeeks.length > 1 ? handleNextWeek : undefined}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        currentWeekLabel={currentWeekLabel}
        onCopyWeek={currentWeek ? handleCopyWeek : undefined}
        onPasteWeek={currentWeek ? handlePasteWeek : undefined}
        canCopyWeek={canCopyWeek}
        canPasteWeek={canPasteWeek}
      />
      <div className="layout">
        <SideActions 
          onAddTask={handleAddClick} 
          onClear={handleClearTasks} 
          hasTasks={tasks.length > 0}
          helpMode={helpMode}
          onToggleHelp={() => setHelpMode(!helpMode)}
          balanceMode={balanceMode}
          onToggleBalance={() => setBalanceMode(!balanceMode)}
          onPlan={() => setShowPlanModal(true)}
          onViewCalendar={() => setShowCalendar(true)}
          onShowGuide={() => setShowGuide(true)}
        />
        <div className="matrix-main">
          <QuadrantGrid
            quadrants={quadrants}
            tasks={weekTasks}
            onEditTask={handleEdit}
            onDeleteTask={handleDelete}
            helpMode={helpMode}
            onMoveTask={handleMoveTask}
            balanceMode={balanceMode}
            onCopyTask={handleCopyTask}
            onPasteTask={handlePasteTask}
            copiedTask={copiedTask}
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
        timeWindow={currentTimeWindow}
        allTasks={tasks}
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
      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSave={handlePlanUpdate}
        currentPlan={currentTimeWindow}
        existingPlans={weekPlans}
      />
      <CalendarView
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        tasks={tasks}
        startDate={combinedDateRange.startDate}
        endDate={combinedDateRange.endDate}
        hoursPerDay={currentWeek?.hoursPerDay || 8}
      />
      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
      <ConfirmDialog
        isOpen={!!pasteError}
        title="Cannot Paste Task"
        message={pasteError}
        confirmText="OK"
        cancelText=""
        onConfirm={() => {
          setPasteError('')
          setCopiedTask(null)
        }}
        onCancel={() => {
          setPasteError('')
          setCopiedTask(null)
        }}
      />
    </div>
  )
}

export default App
