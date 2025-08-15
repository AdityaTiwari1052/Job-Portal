import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded border border-gray-300 text-blue-600",
          "focus:ring-blue-500 focus:ring-offset-0 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
      <Check className="absolute h-3 w-3 text-white left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none" />
    </div>
  )
})

Checkbox.displayName = "Checkbox"

export { Checkbox }
