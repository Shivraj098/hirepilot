import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import PanelHeader from "@/components/ui/panel-header";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/ui/page-header";
import Section from "@/components/ui/section";
import StatCard from "@/components/ui/stat-card";
import Panel from "@/components/ui/panel";
import Link from "next/link";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import Timeline from "@/components/ui/timeline";
import StatRow from "@/components/ui/stat-row";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/signin");
  }

  const [resumes, jobs, versionCount, recentActivity] =
    await Promise.all([
      prisma.resume.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { versions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.job.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          company: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.resumeVersion.count({
        where: { resume: { userId: user.id } },
      }),
      prisma.activity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${user.name ? `, ${user.name}` : ""}`}
        description="Overview of your resumes, jobs, and AI optimization"
      />

      <div className="flex gap-3 pt-2">
        <Link href="/dashboard/resumes/new">
          <Button>Upload Resume</Button>
        </Link>
        <Link href="/dashboard/resumes">
          <Button variant="secondary">Resumes</Button>
        </Link>
        <Link href="/dashboard/jobs">
          <Button variant="secondary">Jobs</Button>
        </Link>
      </div>

      <Section>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Resumes" value={resumes.length} />
          <StatCard label="Jobs Tracked" value={jobs.length} />
          <StatCard label="Versions" value={versionCount} />
          <StatCard
            label="Applications"
            value={jobs.filter((j) => j.status !== "SAVED").length}
          />
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Recent Activity" />
            {recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Upload a resume or add a job to get started"
              />
            ) : (
              <Timeline
                items={recentActivity.map((a) => ({
                  id: a.id,
                  label: a.message ?? a.type,
                  time: new Date(a.createdAt).toLocaleDateString(),
                }))}
              />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Pipeline Overview" />
            <div className="space-y-2">
              <StatRow
                label="Applied"
                value={jobs.filter((j) => j.status === "APPLIED").length}
              />
              <StatRow
                label="Interviewing"
                value={jobs.filter((j) => j.status === "INTERVIEW").length}
              />
              <StatRow
                label="Offers"
                value={jobs.filter((j) => j.status === "OFFER").length}
              />
              <StatRow
                label="Rejected"
                value={jobs.filter((j) => j.status === "REJECTED").length}
              />
            </div>
          </Panel>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Recent Resumes" />
            {resumes.length === 0 ? (
              <EmptyState
                title="No resumes yet"
                description="Upload your first resume to get started"
                action={
                  <Link href="/dashboard/resumes/new">
                    <Button>Upload Resume</Button>
                  </Link>
                }
              />
            ) : (
              resumes.map((r) => (
                <Link key={r.id} href={`/dashboard/resumes/${r.id}`}>
                  <div className="border border-border rounded-lg p-3 mb-2 hover:bg-muted/40 transition cursor-pointer">
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r._count.versions} version
                      {r._count.versions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Recent Jobs" />
            {jobs.length === 0 ? (
              <EmptyState
                title="No jobs tracked yet"
                description="Add your first job application to start tracking"
                action={
                  <Link href="/dashboard/jobs">
                    <Button>Add Job</Button>
                  </Link>
                }
              />
            ) : (
              jobs.map((j) => (
                <Link key={j.id} href={`/dashboard/jobs/${j.id}`}>
                  <div className="border border-border rounded-lg p-3 mb-2 hover:bg-muted/40 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{j.title}</p>
                      <Badge>{j.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{j.company}</p>
                  </div>
                </Link>
              ))
            )}
          </Panel>
        </div>
      </Section>
    </div>
  );
}