import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import PanelHeader from "@/components/ui/panel-header";
import Badge from "@/components/ui/badge";
import Progress from "@/components/ui/progress";
import StatRow from "@/components/ui/stat-row";
import Timeline from "@/components/ui/timeline";
import PageHeader from "@/components/ui/page-header";
import Section from "@/components/ui/section";
import StatCard from "@/components/ui/stat-card";
import Panel from "@/components/ui/panel";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const [resumes, jobs, versionCount] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: user.id },
      include: { versions: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.resumeVersion.count({
      where: {
        resume: {
          userId: user.id,
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <PageHeader
        title="Dashboard"
        description="Overview of resumes, jobs, and AI optimization"
      />

      {/* ================= STATS ================= */}

      <Section>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Resumes" value={resumes.length} />

          <StatCard label="Jobs" value={jobs.length} />

          <StatCard label="Versions" value={versionCount} />

          <StatCard label="AI Runs" value={versionCount} />
        </div>
      </Section>
      {/* ================= GRID ================= */}

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ACTIVITY */}

          <Panel>
            <PanelHeader title="Activity" />

            <Timeline
              items={[
                {
                  id: "1",
                  label: "Resume updated",
                  time: "Today",
                },
                {
                  id: "2",
                  label: "Job added",
                  time: "Yesterday",
                },
              ]}
            />
          </Panel>

          {/* INSIGHTS */}

          <Panel>
            <PanelHeader title="Insights" />

            <StatRow label="Total resumes" value={resumes.length} />

            <StatRow label="Total jobs" value={jobs.length} />

            <StatRow label="Versions" value={versionCount} />

            <Progress value={60} />
          </Panel>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* RESUMES */}

          <Panel>
            <PanelHeader title="Recent Resumes" />

            {resumes.length === 0 ? (
              <p>No resumes</p>
            ) : (
              resumes.map((r) => (
                <div
                  key={r.id}
                  className="
            border
            border-border
            rounded-lg
            p-3
            mb-2
          "
                >
                  {r.title}
                </div>
              ))
            )}
          </Panel>

          {/* JOBS */}

          <Panel>
            <PanelHeader title="Recent Jobs" />

            {jobs.map((j) => (
              <div
                key={j.id}
                className="
          border
          border-border
          rounded-lg
          p-3
          mb-2
        "
              >
                {j.title}

                <Badge>Job</Badge>
              </div>
            ))}
          </Panel>
        </div>
      </Section>
    </div>
  );
}
