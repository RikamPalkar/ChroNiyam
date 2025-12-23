import Tooltip from './Tooltip'

type SideActionsProps = {
  onAddTask: () => void
  onClear: () => void
  hasTasks: boolean
  helpMode: boolean
  onToggleHelp: () => void
  balanceMode: boolean
  onToggleBalance: () => void
}

const SideActions = ({ onAddTask, onClear, hasTasks, helpMode, onToggleHelp, balanceMode, onToggleBalance }: SideActionsProps) => {
  return (
    <aside className="side-actions" aria-label="Task actions">
      <Tooltip content={['Add New Task', 'Create a task and assign it to a quadrant based on urgency and importance.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile primary"
          onClick={onAddTask}
          aria-label="Add task"
          title="Add task"
        >
          ＋
        </button>
      </Tooltip>
      <Tooltip content={['Help Mode', 'Toggle tooltips on or off to show or hide helpful explanations.']} show={helpMode} position="right">
        <button
          type="button"
          className={`icon-tile ${helpMode ? 'primary' : 'ghost'}`}
          onClick={onToggleHelp}
          aria-label="Toggle help"
          title="Toggle help"
          aria-pressed={helpMode}
        >
          ❓
        </button>
      </Tooltip>
      <Tooltip content={['Work-Life Balance Mode', 'Toggle to view task distribution analysis across quadrants.', 'Ensure Q2 (Important & Not Urgent) is your primary focus area.']} show={helpMode} position="right">
        <button
          type="button"
          className={`icon-tile ${balanceMode ? 'primary' : 'ghost'}`}
          onClick={onToggleBalance}
          aria-label="Work-Life Balance Mode"
          title="Work-Life Balance Mode"
          aria-pressed={balanceMode}
        >
          ⚖️
        </button>
      </Tooltip>
      <Tooltip content={['Clear All Tasks', 'Remove all tasks from all quadrants.', 'Warning: This action cannot be undone.']} show={helpMode} position="right">
        <button
          type="button"
          className="icon-tile ghost"
          onClick={onClear}
          disabled={!hasTasks}
          aria-label="Clear tasks"
          title="Clear tasks"
        >
          🗑️
        </button>
      </Tooltip>
    </aside>
  )
}

export default SideActions
