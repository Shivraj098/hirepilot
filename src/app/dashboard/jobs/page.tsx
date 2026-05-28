import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import Panel from "@/components/ui/panel";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import Tabs from "@/components/ui/tabs";
import Section from "@/components/ui/section";
import PipelineColumn from "@/components/jobs/pipeline-column";
import AddJobForm from "@/components/jobs/add-job-form";

function getStatusVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" | "ai" | "outline" {
  const map: Record<
    string,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    SAVED: "default",
    APPLIED: "info",
    INTERVIEW: "warning",
    OFFER: "success",
    REJECTED: "danger",
  };
  return map[status] ?? "default";
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/signin");

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      status: true,
      jobLink: true,
      isFavorite: true,
      createdAt: true,
      priority: true,
    },
  });

  const saved = jobs.filter((j) => j.status === "SAVED");
  const applied = jobs.filter((j) => j.status === "APPLIED");
  const interview = jobs.filter((j) => j.status === "INTERVIEW");
  const offer = jobs.filter((j) => j.status === "OFFER");
  const rejected = jobs.filter((j) => j.status === "REJECTED");

  const listContent = (
    <Section>
      {jobs.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No jobs tracked yet"
            description="Add your first job application to start tracking your pipeline."
            action={
              <div className="flex gap-2 justify-center">
                <AddJobForm />
              </div>
            }
          />
        </Panel>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Panel
              key={job.id}
              padding="sm"
              className="hover:border-border/80 transition-all duration-150 group"
            >
              <div className="flex items-center gap-4">
                {/* Clickable job content */}
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                >
                  {/* Company icon */}
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {job.title}
                      </p>

                      {job.isFavorite && (
                        <span className="text-[--warning] text-xs">★</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {job.company}
                      </span>

                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(new Date(job.createdAt))}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusVariant(job.status)} dot>
                    {job.status}
                  </Badge>

                  {job.jobLink && (
                    <a
                      href={job.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </Section>
  );

  const pipelineContent = (
    <Section>
      {jobs.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No jobs in pipeline"
            description="Add jobs and update their status to see them here."
          />
        </Panel>
      ) : (
        <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
          <PipelineColumn title="Saved" jobs={saved} variant="default" />
          <PipelineColumn title="Applied" jobs={applied} variant="info" />
          <PipelineColumn
            title="Interview"
            jobs={interview}
            variant="warning"
          />
          <PipelineColumn title="Offer" jobs={offer} variant="success" />
          <PipelineColumn title="Rejected" jobs={rejected} variant="danger" />
        </div>
      )}
    </Section>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description={`${jobs.length} job${jobs.length !== 1 ? "s" : ""} tracked`}
        actions={<AddJobForm />}
      />

      <Tabs
        defaultValue="list"
        tabs={[
          {
            label: "List",
            value: "list",
            badge: jobs.length,
            content: listContent,
          },
          {
            label: "Pipeline",
            value: "pipeline",
            content: pipelineContent,
          },
        ]}
      />
    </div>
  );
}
