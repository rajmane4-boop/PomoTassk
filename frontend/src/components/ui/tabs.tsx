import * as React from "react"
import { cn } from "../../lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export function TabsList({ className, children, activeValue, onValueChange }: any) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export function TabsTrigger({ value, activeValue, onValueChange, className, children, disabled }: any) {
  const isActive = value === activeValue
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-background text-foreground shadow-sm font-semibold"
          : "hover:text-foreground/80 hover:bg-background/40",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, activeValue, className, children }: any) {
  if (value !== activeValue) return null
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  )
}
