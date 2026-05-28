import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "py-8 px-4",
  md: "py-12 px-6",
  lg: "py-16 px-8",
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes[size],
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-3 rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold text-foreground mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}