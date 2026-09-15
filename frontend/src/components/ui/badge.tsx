import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "urgent" | "high" | "medium" | "low"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground border border-border",
    success: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    urgent: "border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold",
    high: "border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 font-medium",
    medium: "border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    low: "border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
