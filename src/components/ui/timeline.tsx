import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  label: string;
  time?: string;
  type?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

function getTypeColor(type?: string): string {
  const map: Record<string, string> = {
    RESUME_CREATED: "bg-[--info]",
    RESUME_SCORED: "bg-[--ai]",
    RESUME_TAILORED: "bg-[--ai]",
    RESUME_INTELLIGENCE: "bg-[--ai]",
    JOB_CREATED: "bg-[--success]",
    JOB_ANALYZED: "bg-[--success]",
    JOB_APPLIED: "bg-[--warning]",
    MATCH_ANALYZED: "bg-[--info]",
    default: "bg-muted-foreground",
  };
  return map[type ?? "default"] ?? map.default;
}

export default function Timeline({
  items,
  className,
}: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          {/* Line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full shrink-0 mt-1.5",
                getTypeColor(item.type)
              )}
            />
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 mb-1" />
            )}
          </div>

          {/* Content */}
          <div
            className={cn(
              "pb-4 min-w-0",
              index === items.length - 1 && "pb-0"
            )}
          >
            <p className="text-sm font-medium text-foreground leading-tight">
              {item.label}
            </p>
            {item.time && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.time}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}