import { useState, useEffect } from "react"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select } from "./ui/select"
import type { Task } from "../lib/api"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskToEdit?: Task | null
  onSave: (taskData: Partial<Task>) => Promise<void>
}

export function TaskDialog({ open, onOpenChange, taskToEdit, onSave }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [category, setCategory] = useState<Task["category"]>("General")
  const [dueDate, setDueDate] = useState<string>("")
  const [estimatedPomodoros, setEstimatedPomodoros] = useState<number>(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title)
      setDescription(taskToEdit.description || "")
      setPriority(taskToEdit.priority)
      setCategory(taskToEdit.category)
      setDueDate(taskToEdit.due_date || "")
      setEstimatedPomodoros(taskToEdit.estimated_pomodoros || 1)
    } else {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setCategory("General")
      setDueDate("")
      setEstimatedPomodoros(2)
    }
    setError("")
  }, [taskToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please provide a task title.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        due_date: dueDate ? dueDate : null,
        estimated_pomodoros: Number(estimatedPomodoros) || 1,
      })
      onOpenChange(false)
    } catch (err) {
      setError("An error occurred while saving the task.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update your task details and focus estimates." : "Organize your workflow and set pomodoro session estimates."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground">
              Task Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Implement authentication flow..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              placeholder="Add key notes, links, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="mt-1"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Category</label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task["category"])}
                className="mt-1"
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Coding">Coding</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
              </Select>
            </div>
          </div>

          {/* Due Date & Pomodoros Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Estimated Pomodoros (🍅)</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={estimatedPomodoros}
                onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : taskToEdit ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
