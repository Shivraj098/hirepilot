import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createResume } from "@/server/actions/resume.actions";
import { createJob } from "@/server/actions/job.actions";
import Link from "next/link";

import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user?.id) {
  return (
    <Card className="p-6 text-sm text-muted-foreground">
      Loading dashboard...
    </Card>
  );
}

  const [resumes, jobs, versionCount] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: user.id },
      include: { versions: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),

    prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage resumes, jobs, and optimization workflow
        </p>
      </div>

      {/* ======================= */}
      {/* STATS */}
      {/* ======================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Resumes</p>
          <p className="text-2xl font-semibold">{resumes.length}</p>
        </Card>

        <Card className="p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Jobs</p>
          <p className="text-2xl font-semibold">{jobs.length}</p>
        </Card>

        <Card className="p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Versions</p>
          <p className="text-2xl font-semibold">{versionCount}</p>
        </Card>
      </div>

      {/* ======================= */}
      {/* QUICK ACTIONS */}
      {/* ======================= */}

      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Create new resume or add a job.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <form
            action={async (formData) => {
              "use server";
              const title = formData.get("title") as string;
              if (!title) return;
              await createResume(title);
            }}
            className="flex gap-2"
          >
            <Input name="title" placeholder="Resume title" />
            <Button type="submit">New Resume</Button>
          </form>

          <form
            action={async (formData) => {
              "use server";

              await createJob({
                title: formData.get("title") as string,
                company: formData.get("company") as string,
                location: "",
                jobLink: "",
                description: "",
              });
            }}
            className="flex gap-2"
          >
            <Input name="title" placeholder="Job title" />

            <Input name="company" placeholder="Company" />

            <Button type="submit">Add Job</Button>
          </form>
        </div>
      </Card>

      {/* ======================= */}
      {/* RESUMES */}
      {/* ======================= */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Resumes</h2>

        {/* Resume list */}

        {resumes.length === 0 ? (
          <Card className="p-6 space-y-1">

  <p className="text-sm font-medium">
    No resumes yet
  </p>

  <p className="text-sm text-muted-foreground">
    Create a resume to start tailoring for jobs.
  </p>

</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Link key={resume.id} href={`/dashboard/${resume.id}`}>
                <Card className="p-5 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <h3 className="font-medium">{resume.title}</h3>

                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className="
        text-xs
        rounded-full
        border border-border
        bg-muted
        px-2 py-1
      "
                    >
                      {resume.versions.length} versions
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ======================= */}
      {/* JOBS */}
      {/* ======================= */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Jobs</h2>

        {/* Job list */}

        {jobs.length === 0 ? (
          <Card className="p-6 space-y-1">

  <p className="text-sm font-medium">
    No jobs yet
  </p>

  <p className="text-sm text-muted-foreground">
    Add a job to generate tailored resumes.
  </p>

</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <Card className="p-5 space-y-3 hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <h3 className="font-medium">{job.title}</h3>

                    <p className="text-sm text-muted-foreground">
                      {job.company}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
