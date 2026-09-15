import * as React from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ToastItem {
  id: string
  title?: string
  description?: string
  type?: "default" | "success" | "error" | "info"
}

interface ToastContextType {
  toasts: ToastItem[]
  toast: (options: Omit<ToastItem, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

let toastGlobal: ((options: Omit<ToastItem, "id">) => void) | null = null

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback((options: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastItem = { ...options, id }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [removeToast])

  React.useEffect(() => {
    toastGlobal = addToast
    return () => {
      toastGlobal = null
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, toast: addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-fade-in bg-background text-foreground",
              t.type === "success" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
              t.type === "error" && "border-destructive/40 bg-destructive/10 text-destructive dark:text-rose-200",
              t.type === "info" && "border-blue-500/40 bg-blue-500/10 text-blue-950 dark:text-blue-100"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
            
            <div className="flex-1">
              {t.title && <div className="font-semibold text-sm">{t.title}</div>}
              {t.description && <div className="text-xs opacity-90 mt-0.5">{t.description}</div>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="opacity-70 hover:opacity-100 cursor-pointer p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    return {
      toast: (opts: Omit<ToastItem, "id">) => {
        if (toastGlobal) toastGlobal(opts)
      }
    }
  }
  return context
}

export const toast = (options: Omit<ToastItem, "id">) => {
  if (toastGlobal) toastGlobal(options)
}
