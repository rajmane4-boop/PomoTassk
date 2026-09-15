import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Settings, Target } from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { api, type Task } from "../lib/api"
import { soundManager } from "../lib/audio"
import { useToast } from "./ui/toast"

type SessionMode = "work" | "short_break" | "long_break"

interface PomodoroTimerProps {
  activeTask: Task | null
  onTaskUpdated: () => void
  onClearActiveTask: () => void
}

export function PomodoroTimer({ activeTask, onTaskUpdated, onClearActiveTask }: PomodoroTimerProps) {
  const { toast } = useToast()

  // Settings
  const [workMinutes, setWorkMinutes] = useState<number>(25)
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5)
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Timer State
  const [mode, setMode] = useState<SessionMode>("work")
  const [timeLeft, setTimeLeft] = useState<number>(workMinutes * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [cycleCount, setCycleCount] = useState<number>(1)

  const timerRef = useRef<number | null>(null)

  // Calculate total seconds for the current mode
  const getTotalSeconds = (currentMode: SessionMode) => {
    switch (currentMode) {
      case "work":
        return workMinutes * 60
      case "short_break":
        return shortBreakMinutes * 60
      case "long_break":
        return longBreakMinutes * 60
    }
  }

  // Handle mode switch
  const switchMode = (newMode: SessionMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(getTotalSeconds(newMode))
  }

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode, activeTask])

  // When timer hits 0
  const handleTimerComplete = async () => {
    setIsRunning(false)

    if (soundEnabled) {
      soundManager.playTimerComplete()
    }

    // Fire celebratory confetti for completed focus session
    if (mode === "work") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      })
    }

    try {
      const duration = mode === "work" ? workMinutes : mode === "short_break" ? shortBreakMinutes : longBreakMinutes

      if (mode === "work" && activeTask) {
        await api.incrementPomodoro(activeTask.id, duration)
        toast({
          title: "Focus Session Finished! 🍅",
          description: `Great job! Logged 25m to "${activeTask.title}".`,
          type: "success"
        })
        onTaskUpdated()
      } else {
        await api.logPomodoro({
          task: activeTask ? activeTask.id : null,
          session_type: mode,
          duration_minutes: duration
        })
        toast({
          title: mode === "work" ? "Focus Sprint Complete!" : "Break Finished!",
          description: mode === "work" ? "Take a well-deserved breather." : "Ready to jump back into focus?",
          type: "info"
        })
      }
    } catch (err) {
      console.error("Failed to log pomodoro", err)
    }

    // Auto rotate mode
    if (mode === "work") {
      if (cycleCount % 4 === 0) {
        switchMode("long_break")
      } else {
        switchMode("short_break")
      }
      setCycleCount((c) => c + 1)
    } else {
      switchMode("work")
    }
  }

  const togglePlay = () => {
    if (soundEnabled) soundManager.playClick()
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    if (soundEnabled) soundManager.playClick()
    setIsRunning(false)
    setTimeLeft(getTotalSeconds(mode))
  }

  const skipSession = () => {
    if (soundEnabled) soundManager.playClick()
    setIsRunning(false)
    if (mode === "work") {
      switchMode("short_break")
    } else {
      switchMode("work")
    }
  }

  const adjustMinutes = (delta: number) => {
    setTimeLeft((prev) => Math.max(10, prev + delta * 60))
  }

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Dynamic progress percentage
  const totalSeconds = getTotalSeconds(mode)
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100

  // SVG circle calculations
  const radius = 96
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Theme color for mode
  const modeColor = {
    work: "text-rose-500 stroke-rose-500",
    short_break: "text-emerald-500 stroke-emerald-500",
    long_break: "text-blue-500 stroke-blue-500",
  }[mode]

  const modeBorderColor = {
    work: "border-rose-500/30 bg-rose-500/5",
    short_break: "border-emerald-500/30 bg-emerald-500/5",
    long_break: "border-blue-500/30 bg-blue-500/5",
  }[mode]

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 border ${modeBorderColor} shadow-md`}>
      <CardContent className="p-6">
        {/* Top bar: Mode Switcher & Quick settings */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex rounded-lg bg-muted p-1 text-xs font-medium">
            <button
              onClick={() => switchMode("work")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "work" ? "bg-background text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode("short_break")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "short_break" ? "bg-background text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Short (5m)
            </button>
            <button
              onClick={() => switchMode("long_break")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "long_break" ? "bg-background text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Long (15m)
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Bell" : "Unmute Bell"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground/60" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsSettingsOpen(true)}
              title="Custom Durations"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Active Task Link Banner */}
        <div className="mb-6 rounded-lg border bg-background/70 backdrop-blur-sm p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Target className="h-4 w-4 text-rose-500 shrink-0" />
            {activeTask ? (
              <div className="truncate">
                <span className="text-muted-foreground">Focusing on: </span>
                <span className="font-semibold text-foreground">{activeTask.title}</span>
                <span className="ml-2 text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-medium">
                  🍅 {activeTask.completed_pomodoros}/{activeTask.estimated_pomodoros}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                No active task selected. Click "Focus" on any task to bind it!
              </span>
            )}
          </div>
          {activeTask && (
            <button
              onClick={onClearActiveTask}
              className="text-muted-foreground hover:text-foreground text-[11px] underline cursor-pointer shrink-0 ml-2"
            >
              Unbind
            </button>
          )}
        </div>

        {/* Circular Progress Display */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 220 220">
            {/* Background track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="stroke-muted"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated countdown indicator */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className={`transition-all duration-500 ease-linear ${modeColor}`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time & Session Center Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mode === "work" ? "Deep Focus" : mode === "short_break" ? "Rest & Breathe" : "Long Recharge"}
            </span>
            <span className="mt-1 text-[11px] text-muted-foreground/80">
              Cycle #{cycleCount}
            </span>
          </div>
        </div>

        {/* Quick Adjustment Pills */}
        <div className="flex justify-center items-center gap-2 mb-4 text-xs">
          <button
            onClick={() => adjustMinutes(-1)}
            disabled={timeLeft <= 60}
            className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
          >
            -1 min
          </button>
          <button
            onClick={() => adjustMinutes(5)}
            className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            +5 min
          </button>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            title="Reset to start"
            className="h-10 w-10 rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={togglePlay}
            size="lg"
            className={`px-8 h-12 rounded-full font-bold shadow-lg transition-all ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                : mode === "work"
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 fill-current" /> Start
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skipSession}
            title="Skip to next session"
            className="h-10 w-10 rounded-full"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogHeader>
          <DialogTitle>Timer Intervals</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Focus Duration (minutes)</label>
            <Input
              type="number"
              min={1}
              max={120}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 25))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Short Break (minutes)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Math.max(1, parseInt(e.target.value) || 5))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Long Break (minutes)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Math.max(1, parseInt(e.target.value) || 15))}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setIsSettingsOpen(false)
              setTimeLeft(getTotalSeconds(mode))
            }}
          >
            Save Durations
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  )
}
