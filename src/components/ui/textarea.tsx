import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-xl",
            "border border-input bg-background text-foreground",
            "px-3 py-2.5 text-sm",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-none",
            error && "border-destructive focus:ring-destructive/30",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;