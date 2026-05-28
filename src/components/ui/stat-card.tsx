import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
  variant?: "default" | "ai";
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  className,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 space-y-3",
        variant === "default" && "bg-card border-border",
        variant === "ai" && "ai-gradient border-[--ai-border]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>

        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-md",
              trend.direction === "up"
                ? "text-[--success] bg-[--success]/10"
                : "text-destructive bg-destructive/10"
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}