## ChroNiyam

A minimal, focused task management application built on the Eisenhower Matrix principle. ChroNiyam brings discipline and structure to your time through prioritized task organization.

### About the Name

"ChroNiyam" combines two concepts:
- **Chro** – from "chronological," relating to time and its ordered flow
- **Niyam** – a Sanskrit word meaning "discipline," "rules," or "protocol"

Together, it represents the idea of bringing structured discipline to time management.

### Purpose

ChroNiyam helps you categorize and manage tasks based on their urgency and importance. By organizing work across four quadrants, you gain clarity on what truly matters and where your time should be invested for maximum impact and minimal stress.

### Features

- **Four-Quadrant Task Matrix** – Organize tasks into Do First, Schedule, Delegate, and Eliminate quadrants
- **Task Management** – Add, edit, and delete tasks with ease
- **Smart Organization**
  - Do First: Urgent and Important (crisis mode)
  - Schedule: Not Urgent but Important (strategic planning)
  - Delegate: Urgent but Not Important (distractions)
  - Eliminate: Not Urgent and Not Important (time wasters)
- **Theme Support** – Toggle between light and dark themes with system preference detection
- **Help Mode** – Detailed tooltips explaining the purpose of each quadrant
- **Balance Insights** – View task distribution across quadrants to optimize your workload
- **Persistent Storage** – Tasks are saved locally in your browser
- **Clean UI** – Minimal design with no unnecessary clutter, keeping focus on task management

### Stack

- React 19, TypeScript, Vite
- ESLint (flat config)

### Getting Started

**Install dependencies:**
```bash
npm install
```

**Development:**
```bash
npm run dev
```

**Linting:**
```bash
npm run lint
```

**Build:**
```bash
npm run build
```

### Project Structure

- `src/App.tsx` – Main application component managing state and quadrants
- `src/components/` – Reusable UI components for tasks, modals, and controls
- `src/types/quadrant.ts` – TypeScript type definitions
- `src/index.css` – Layout and styling for quadrants

### How to Use

1. Click the add button to create a new task
2. Select which quadrant the task belongs to based on urgency and importance
3. Track your tasks and review the balance mode to see how your work is distributed
4. Delete or edit tasks as priorities change
5. Use help mode to understand each quadrant's purpose better

### License

Copyright (c) 2025 Rikam Palkar. All rights reserved.

This source code is proprietary and may not be copied, modified, distributed, or used without explicit written permission from the author. See the LICENSE file for details.
