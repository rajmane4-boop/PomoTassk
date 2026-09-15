import { useState, useEffect, useCallback } from "react"
import { Navbar } from "./components/Navbar"
import { StatsHeader } from "./components/StatsHeader"
import { PomodoroTimer } from "./components/PomodoroTimer"
import { TaskList } from "./components/TaskList"
import { TaskDialog } from "./components/TaskDialog"
import { ToastProvider, useToast } from "./components/ui/toast"
import { api, type Task, type DashboardStats } from "./lib/api"

function DashboardContent() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [backendOnline, setBackendOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load data from Django backend
  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedStats] = await Promise.all([
        api.getTasks(),
        api.getStats(),
      ])
      setTasks(fetchedTasks)
      setStats(fetchedStats)
      setBackendOnline(true)

      // If active task exists, update its reference
      if (activeTask) {
        const refreshed = fetchedTasks.find((t) => t.id === activeTask.id)
        if (refreshed) setActiveTask(refreshed)
      }
    } catch (err) {
      console.error("Backend error:", err)
      setBackendOnline(false)
    } finally {
      setLoading(false)
    }
  }, [activeTask])

  useEffect(() => {
    loadData()
  }, [])

  // Periodic heartbeat / refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 15000)
    return () => clearInterval(interval)
  }, [loadData])

  // Handle task completion toggle
  const handleToggleTask = async (id: number) => {
    try {
      const updated = await api.toggleTask(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      toast({
        title: updated.is_completed ? "Task Completed! 🎉" : "Task Re-opened",
        description: `"${updated.title}" marked as ${updated.is_completed ? "done" : "in progress"}.`,
        type: updated.is_completed ? "success" : "default"
      })
      // Refresh stats
      const newStats = await api.getStats()
      setStats(newStats)
    } catch (err) {
      toast({
        title: "Action Failed",
        description: "Could not toggle task status. Make sure Django backend is running.",
        type: "error"
      })
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (id: number) => {
    const taskToDelete = tasks.find((t) => t.id === id)
    if (!window.confirm(`Are you sure you want to delete "${taskToDelete?.title}"?`)) {
      return
    }

    try {
      await api.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      if (activeTask?.id === id) {
        setActiveTask(null)
      }
      toast({
        title: "Task Deleted",
        description: "The task has been permanently removed.",
        type: "default"
      })
      const newStats = await api.getStats()
      setStats(newStats)
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not remove task from server.",
        type: "error"
      })
    }
  }

  // Handle save (create / update)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskToEdit) {
      const updated = await api.updateTask(taskToEdit.id, taskData)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      if (activeTask?.id === updated.id) {
        setActiveTask(updated)
      }
      toast({
        title: "Task Updated",
        description: `"${updated.title}" has been saved.`,
        type: "success"
      })
    } else {
      const created = await api.createTask(taskData)
      setTasks((prev) => [created, ...prev])
      toast({
        title: "Task Created! 🚀",
        description: `"${created.title}" added to your to-do list.`,
        type: "success"
      })
    }
    const newStats = await api.getStats()
    setStats(newStats)
  }

  const handleOpenNewTask = () => {
    setTaskToEdit(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setIsTaskDialogOpen(true)
  }

  const handleSelectActiveTask = (task: Task) => {
    setActiveTask(task)
    toast({
      title: "Pomodoro Target Set 🎯",
      description: `Timer linked to "${task.title}". Focus sessions will increment this task.`,
      type: "info"
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      <Navbar onOpenNewTask={handleOpenNewTask} backendOnline={backendOnline} />

      <main className="container mx-auto px-4 sm:px-8 py-6 flex-1 max-w-7xl">
        {/* Backend Connection Warning Banner */}
        {!backendOnline && !loading && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div className="text-xs">
                <span className="font-semibold">Backend offline: </span>
                <span>Django REST server is not responding at http://127.0.0.1:8000. Start it with <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">python manage.py runserver</code>.</span>
              </div>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-semibold underline hover:opacity-80 cursor-pointer ml-4 shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Productivity Statistics Overview */}
        <StatsHeader stats={stats} loading={loading} />

        {/* Main Grid: Left = Task List, Right = Pomodoro Focus Station */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tasks Section (7 cols on large screens) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Your Tasks</h2>
                <p className="text-xs text-muted-foreground">
                  Organize, prioritize, and conquer your goals with focused sprints.
                </p>
              </div>
            </div>

            <TaskList
              tasks={tasks}
              activeTaskId={activeTask ? activeTask.id : null}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onSelectActiveTask={handleSelectActiveTask}
              onOpenNewTask={handleOpenNewTask}
            />
          </section>

          {/* Pomodoro Focus Station (5 cols on large screens, sticky) */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Focus Station</h2>
              <p className="text-xs text-muted-foreground">
                Deep work cycles powered by the Pomodoro Technique.
              </p>
            </div>

            <PomodoroTimer
              activeTask={activeTask}
              onTaskUpdated={loadData}
              onClearActiveTask={() => setActiveTask(null)}
            />
          </section>
        </div>
      </main>

      {/* Create / Edit Task Modal */}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        taskToEdit={taskToEdit}
        onSave={handleSaveTask}
      />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}
