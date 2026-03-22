import Panel from "@/components/ui/panel";
import PanelHeader from "@/components/ui/panel-header";
import Badge from "@/components/ui/badge";

export default function PipelineColumn({
  title,
  jobs,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobs: any[];
}) {
  return (

    <Panel className="space-y-3">

      <PanelHeader title={title} />

      {jobs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No jobs
        </p>
      )}

      {jobs.map((job) => (

        <div
          key={job.id}
          className="
          rounded-xl
border
border-border/70
p-3
bg-muted/20
hover:bg-muted/40
transition
        "
        >

          <p className="font-medium">
            {job.title}
          </p>

          <Badge>
            {job.status}
          </Badge>

        </div>

      ))}

    </Panel>
  );
}