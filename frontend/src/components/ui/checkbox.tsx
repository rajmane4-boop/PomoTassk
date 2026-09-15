import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onChange?.(e)
            onCheckedChange?.(e.target.checked)
          }}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "h-5 w-5 shrink-0 rounded-md border border-primary ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer flex items-center justify-center",
            checked ? "bg-primary text-primary-foreground shadow-sm" : "bg-transparent border-muted-foreground/40 hover:border-primary",
            className
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"
