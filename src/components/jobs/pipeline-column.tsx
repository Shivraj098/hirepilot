import Panel from "@/components/ui/panel";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  company: string;
  status: string;
  location?: string | null;
};

type Variant = "info" | "warning" | "success" | "danger" | "default";

const headerColors: Record<Variant, string> = {
  info: "text-[--info] bg-[--info]/10 border-[--info]/20",
  warning: "text-[--warning] bg-[--warning]/10 border-[--warning]/20",
  success: "text-[--success] bg-[--success]/10 border-[--success]/20",
  danger: "text-destructive bg-destructive/10 border-destructive/20",
  default: "text-muted-foreground bg-muted border-border",
};

export default function PipelineColumn({
  title,
  jobs,
  variant = "default",
}: {
  title: string;
  jobs: Job[];
  variant?: Variant;
}) {
  return (
    <div className="space-y-2">
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wide",
          headerColors[variant]
        )}
      >
        <span>{title}</span>
        <span className="text-xs font-bold">{jobs.length}</span>
      </div>

      {/* Jobs */}
      {jobs.length === 0 ? (
        <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-border">
          <p className="text-xs text-muted-foreground">No jobs</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
              <Panel
                padding="sm"
                className="cursor-pointer hover:border-border/80 transition-all duration-150 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate leading-tight">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {job.company}
                    </p>
                    {job.location && (
                      <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                        {job.location}
                      </p>
                    )}
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}