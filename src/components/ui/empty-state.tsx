import { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="
      rounded-2xl
      border border-border/60
      bg-card
      p-6
      text-center
      space-y-2
    "
    >
      <p className="font-medium">
        {title}
      </p>

      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}