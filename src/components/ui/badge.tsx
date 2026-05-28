import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "ai"
  | "info"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-secondary text-secondary-foreground border border-border",
  success:
    "bg-[--success]/10 text-[--success] border border-[--success]/20",
  warning:
    "bg-[--warning]/10 text-[--warning] border border-[--warning]/20",
  danger:
    "bg-destructive/10 text-destructive border border-destructive/20",
  ai: "ai-gradient text-[--ai] border border-[--ai-border]",
  info: "bg-[--info]/10 text-[--info] border border-[--info]/20",
  outline:
    "bg-transparent border border-border text-muted-foreground",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-[--success]",
  warning: "bg-[--warning]",
  danger: "bg-destructive",
  ai: "bg-[--ai]",
  info: "bg-[--info]",
  outline: "bg-muted-foreground",
};

export default function Badge({
  children,
  variant = "default",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5 rounded-md text-xs font-medium",
        "whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
