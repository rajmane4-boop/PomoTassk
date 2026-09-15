import { useState } from "react"
import { Search, Calendar, Target, Edit3, Trash2, CheckCircle2 } from "lucide-react"
import confetti from "canvas-confetti"
import type { Task } from "../lib/api"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { Select } from "./ui/select"
import { soundManager } from "../lib/audio"

interface TaskListProps {
  tasks: Task[]
  activeTaskId: number | null
  onToggleTask: (id: number) => Promise<void>
  onDeleteTask: (id: number) => Promise<void>
  onEditTask: (task: Task) => void
  onSelectActiveTask: (task: Task) => void
  onOpenNewTask: () => void
}

const CATEGORIES = ["All", "Work", "Study", "Coding", "Personal", "Health", "General"]

export function TaskList({
  tasks,
  activeTaskId,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onSelectActiveTask,
  onOpenNewTask,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "today" | "overdue">("all")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")

  const handleToggle = async (task: Task) => {
    if (!task.is_completed) {
      soundManager.playTaskComplete()
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      })
    } else {
      soundManager.playClick()
    }
    await onToggleTask(task.id)
  }

  // Filter tasks locally
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(q)
      const matchesDesc = task.description.toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc) return false
    }

    // Category
    if (categoryFilter !== "All" && task.category !== categoryFilter) {
      return false
    }

    // Priority
    if (priorityFilter !== "All" && task.priority !== priorityFilter) {
      return false
    }

    // Status
    const todayStr = new Date().toISOString().split("T")[0]
    if (statusFilter === "pending" && task.is_completed) return false
    if (statusFilter === "completed" && !task.is_completed) return false
    if (statusFilter === "today") {
      if (task.due_date !== todayStr) return false
    }
    if (statusFilter === "overdue") {
      if (!task.due_date || task.due_date >= todayStr || task.is_completed) return false
    }

    return true
  })

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split("-").map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          {/* Top Row: Search & Priority Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by name or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-36 bg-background/50 text-xs"
              >
                <option value="All">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center justify-between border-t pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              {(
                [
                  { id: "all", label: "All Tasks" },
                  { id: "pending", label: "Pending" },
                  { id: "today", label: "Due Today" },
                  { id: "overdue", label: "Overdue" },
                  { id: "completed", label: "Completed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              <span className="text-[11px] text-muted-foreground mr-1 hidden md:inline">Category:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-secondary text-secondary-foreground font-medium ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center bg-card/30">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No tasks found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {searchQuery || categoryFilter !== "All" || priorityFilter !== "All"
                  ? "Try clearing your search or filters to see more tasks."
                  : "You're all caught up! Create a new task to stay organized and productive."}
              </p>
              <Button onClick={onOpenNewTask} variant="outline" size="sm" className="mt-4">
                Add New Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const isTargeted = activeTaskId === task.id
            const todayStr = new Date().toISOString().split("T")[0]
            const isDueToday = task.due_date === todayStr

            return (
              <Card
                key={task.id}
                className={`group transition-all duration-200 hover:shadow-md ${
                  task.is_completed
                    ? "opacity-60 bg-muted/30 border-border/40"
                    : isTargeted
                    ? "border-rose-500/60 ring-2 ring-rose-500/20 bg-rose-500/[0.02]"
                    : "hover:border-primary/40 bg-card"
                }`}
              >
                <CardContent className="p-4 flex items-start gap-3 sm:gap-4">
                  {/* Checkbox */}
                  <div className="pt-0.5">
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => handleToggle(task)}
                      aria-label="Mark task complete"
                    />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={`text-sm font-semibold tracking-tight transition-all ${
                            task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Focus Button */}
                        {!task.is_completed && (
                          <Button
                            variant={isTargeted ? "default" : "outline"}
                            size="sm"
                            onClick={() => onSelectActiveTask(task)}
                            className={`h-7 px-2 text-xs rounded-md ${
                              isTargeted
                                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
                                : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                            }`}
                            title="Set as active Pomodoro task"
                          >
                            <Target className="h-3.5 w-3.5 mr-1" />
                            {isTargeted ? "Focusing" : "Focus"}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditTask(task)}
                          className="h-7 w-7 rounded-md"
                          title="Edit Task"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          className="h-7 w-7 rounded-md hover:text-destructive hover:bg-destructive/10"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Badges Footer */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
                      {/* Priority Badge */}
                      <Badge variant={task.priority}>
                        {task.priority.toUpperCase()}
                      </Badge>

                      {/* Category Badge */}
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {task.category}
                      </span>

                      {/* Pomodoros counter */}
                      <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        <span>🍅</span>
                        <span>
                          {task.completed_pomodoros} / {task.estimated_pomodoros}
                        </span>
                      </div>

                      {/* Due Date */}
                      {task.due_date && (
                        <div
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            task.is_overdue
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : isDueToday
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>
                            {isDueToday
                              ? "Today"
                              : task.is_overdue
                              ? `Overdue (${formatDate(task.due_date)})`
                              : formatDate(task.due_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
