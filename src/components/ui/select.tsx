import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-9 rounded-xl appearance-none",
              "border border-input bg-background text-foreground",
              "pl-3 pr-8 text-sm",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-destructive",
              className
            )}
            {...props}
          >
            {children}
          </select>

          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;