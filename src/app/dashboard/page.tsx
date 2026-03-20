import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

import PageHeader from "@/components/ui/page-header";
import Section from "@/components/ui/section";
import StatCard from "@/components/ui/stat-card";
import Panel from "@/components/ui/panel";
import EmptyState from "@/components/ui/empty-state";

import Link from "next/link";

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

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Resumes"
            value={resumes.length}
          />

          <StatCard
            label="Jobs"
            value={jobs.length}
          />

          <StatCard
            label="Versions"
            value={versionCount}
          />

        </div>

      </Section>

      {/* ================= GRID ================= */}

      <Section>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* RESUMES PANEL */}

          <Panel className="space-y-4">

            <h2 className="text-lg font-semibold">
              Recent Resumes
            </h2>

            {resumes.length === 0 ? (
              <EmptyState
                title="No resumes yet"
                description="Create a resume to start tailoring"
              />
            ) : (
              <div className="space-y-2">

                {resumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/dashboard/${resume.id}`}
                    className="
                    block
                    rounded-xl
                    border
                    border-border/60
                    p-4
                    hover:bg-muted/40
                    transition
                  "
                  >
                    <div className="flex justify-between">

                      <div>
                        <p className="font-medium">
                          {resume.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {resume.versions.length} versions
                        </p>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          resume.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>
                  </Link>
                ))}

              </div>
            )}

          </Panel>

          {/* JOBS PANEL */}

          <Panel className="space-y-4">

            <h2 className="text-lg font-semibold">
              Recent Jobs
            </h2>

            {jobs.length === 0 ? (
              <EmptyState
                title="No jobs yet"
                description="Add a job to generate tailored resumes"
              />
            ) : (
              <div className="space-y-2">

                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="
                    block
                    rounded-xl
                    border
                    border-border/60
                    p-4
                    hover:bg-muted/40
                    transition
                  "
                  >
                    <div className="flex justify-between">

                      <div>

                        <p className="font-medium">
                          {job.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {job.company}
                        </p>

                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          job.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>
                  </Link>
                ))}

              </div>
            )}

          </Panel>

        </div>

      </Section>

    </div>
  );
}