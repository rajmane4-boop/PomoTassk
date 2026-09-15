const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface Task {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'Work' | 'Study' | 'Personal' | 'Health' | 'Coding' | 'General'
  due_date: string | null
  is_completed: boolean
  completed_at: string | null
  estimated_pomodoros: number
  completed_pomodoros: number
  is_overdue: boolean
  pomodoro_sessions_count: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  high_priority_pending: number
  total_pomodoros: number
  total_focus_minutes: number
  today_pomodoros: number
  today_focus_minutes: number
}

export interface PomodoroSession {
  id: number
  task: number | null
  task_title?: string
  session_type: 'work' | 'short_break' | 'long_break'
  duration_minutes: number
  completed_at: string
}

export const api = {
  async getTasks(params?: Record<string, string>): Promise<Task[]> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) searchParams.append(key, val)
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const res = await fetch(`${API_BASE_URL}/tasks/${query}`)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create task')
    return res.json()
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update task')
    return res.json()
  },

  async deleteTask(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete task')
  },

  async toggleTask(id: number): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/toggle/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('Failed to toggle task')
    return res.json()
  },

  async incrementPomodoro(id: number, duration_minutes = 25): Promise<{ task: Task; session: PomodoroSession }> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/increment_pomodoro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_minutes }),
    })
    if (!res.ok) throw new Error('Failed to increment pomodoro')
    return res.json()
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/stats/`)
    if (!res.ok) throw new Error('Failed to fetch statistics')
    return res.json()
  },

  async logPomodoro(data: { task?: number | null; session_type: string; duration_minutes: number }): Promise<PomodoroSession> {
    const res = await fetch(`${API_BASE_URL}/pomodoro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to log pomodoro session')
    return res.json()
  },
}
