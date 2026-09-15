import { useState, useEffect } from "react"
import { Moon, Sun, Plus } from "lucide-react"
import { Button } from "./ui/button"

interface NavbarProps {
  onOpenNewTask: () => void
  backendOnline: boolean
}

export function Navbar({ onOpenNewTask, backendOnline }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
      )
    }
    return true
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-md shadow-red-500/20 text-white">
            <span className="text-xl select-none">🍅</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                PomoTask
              </h1>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Django + Shadcn
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              To-Do & Pomodoro Productivity Hub
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs text-muted-foreground bg-muted/40">
            <div
              className={`h-2 w-2 rounded-full ${
                backendOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-rose-500"
              }`}
            />
            <span>{backendOnline ? "Django Connected" : "Connecting..."}</span>
          </div>

          {/* Dark / Light Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" /> : <Moon className="h-4 w-4 text-slate-700 transition-transform -rotate-12 hover:rotate-0" />}
          </Button>

          {/* New Task Button */}
          <Button
            onClick={onOpenNewTask}
            className="gap-1.5 shadow-sm rounded-lg font-medium transition-all hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
