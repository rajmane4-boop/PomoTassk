import { CheckCircle, Flame, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Progress } from "./ui/progress"
import type { DashboardStats } from "../lib/api"

interface StatsHeaderProps {
  stats: DashboardStats | null
  loading?: boolean
}

export function StatsHeader({ stats, loading }: StatsHeaderProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/50 h-24 border-border/40" />
        ))}
      </div>
    )
  }

  const focusHours = (stats.total_focus_minutes / 60).toFixed(1)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Completed Tasks */}
      <Card className="hover:border-primary/40 transition-colors bg-gradient-to-br from-card to-card/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed Tasks</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{stats.completed_tasks}</span>
            <span className="text-xs text-muted-foreground">of {stats.total_tasks}</span>
          </div>
          <div className="mt-2.5">
            <Progress value={stats.completion_rate} indicatorClassName="bg-emerald-500" className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Pomodoro Sessions */}
      <Card className="hover:border-primary/40 transition-colors bg-gradient-to-br from-card to-card/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Focus Sessions</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{stats.total_pomodoros}</span>
            <span className="text-xs text-muted-foreground">
              ({stats.today_pomodoros} today)
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.today_pomodoros > 0 ? "🔥 Great focus momentum today" : "Start a focus sprint"}
          </p>
        </CardContent>
      </Card>

      {/* Focus Time */}
      <Card className="hover:border-primary/40 transition-colors bg-gradient-to-br from-card to-card/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Focus Hours</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{focusHours}</span>
            <span className="text-xs text-muted-foreground">hrs logged</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.today_focus_minutes} mins completed today
          </p>
        </CardContent>
      </Card>

      {/* Urgent / High Attention */}
      <Card className="hover:border-primary/40 transition-colors bg-gradient-to-br from-card to-card/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">High Priority</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{stats.high_priority_pending}</span>
            <span className="text-xs text-muted-foreground">tasks remaining</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.high_priority_pending > 0 ? "Requires close attention" : "All critical tasks clear!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
