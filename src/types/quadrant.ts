export type Theme = 'light' | 'dark'

export type Quadrant = {
  title: string
  description: string
  className: string
  tooltip: string[]
}

export type QuadrantKey = Quadrant['title']

export type Task = {
  id: string
  title: string
  description?: string
  quadrant: QuadrantKey
}
