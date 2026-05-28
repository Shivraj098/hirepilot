import { cn } from "@/lib/utils";

export default function Logo({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
      {/* Icon mark */}
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 11L5.5 7.5L8 10L12 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground"
          />
          <circle
            cx="12"
            cy="4"
            r="1.2"
            fill="currentColor"
            className="text-primary-foreground"
          />
        </svg>
      </div>

      {!collapsed && (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          HirePilot
        </span>
      )}
    </div>
  );
}