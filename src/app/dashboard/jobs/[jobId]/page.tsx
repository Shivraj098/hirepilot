import PageHeader from "@/components/ui/page-header";
import Tabs from "@/components/ui/tabs";
import Panel from "@/components/ui/panel";
import Section from "@/components/ui/section";
import Divider from "@/components/ui/divider";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateSkillGap } from "@/server/ai/skills/skill-gap";
import { applySuggestion } from "@/server/actions/suggestion.actions";
import { regenerateInterviewPrep } from "@/server/actions/interview.action";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface Props {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/signin");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
    include: {
      skillGaps: true,
      interviewPreps: true,

      versions: {
        include: {
          resume: true,
          aTSResults: true,
          suggestions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!job) {
    redirect("/dashboard");
  }

  const baseResume = await prisma.resume.findFirst({
    where: { userId: user.id },
    include: {
      versions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const baseVersion = baseResume?.versions.find(
    (v) => v.versionType === "BASE",
  );

  const skillGap = baseVersion
    ? calculateSkillGap(baseVersion.content, job.description)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.company}${job.location ? " — " + job.location : ""}`}
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          // ---------------- OVERVIEW ----------------

          {
            label: "Overview",
            value: "overview",
            content: (
              <Section>
                <Panel>
                  <h2 className="font-semibold mb-4">Job Description</h2>

                  <div className="text-sm whitespace-pre-wrap">
                    {job.description}
                  </div>
                </Panel>

                {skillGap && (
                  <Panel>
                    <h2 className="font-semibold mb-4">Match Score</h2>

                    <p className="text-lg font-medium">
                      {skillGap.matchPercentage}%
                    </p>
                  </Panel>
                )}
              </Section>
            ),
          },

          // ---------------- SKILL GAP ----------------

          {
            label: "Skill Gap",
            value: "gap",
            content: (
              <Section>
                {skillGap && (
                  <Panel>
                    <h2 className="font-semibold mb-4">Missing Skills</h2>

                    <div className="flex flex-wrap gap-2">
                      {skillGap.missingSkills.map((s: string) => (
                        <span
                          key={s}
                          className="
                        px-2 py-1
                        border
                        border-border
                        rounded-full
                        text-sm
                      "
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Panel>
                )}
              </Section>
            ),
          },

          // ---------------- ROADMAP ----------------

          {
            label: "Roadmap",
            value: "roadmap",
            content: (
              <Section>
                {job.skillGaps.map((gap) => (
                  <Panel key={gap.id}>
                    <p className="font-medium">{gap.skill}</p>

                    <p className="text-sm text-muted-foreground">
                      {gap.reasoning}
                    </p>
                  </Panel>
                ))}
              </Section>
            ),
          },

          // ---------------- VERSIONS ----------------

          {
            label: "Versions",
            value: "versions",
            content: (
              <Section>
                {job.versions.map((v) => (
                  <Panel key={v.id}>
                    <p>{v.resume.title}</p>
                  </Panel>
                ))}
              </Section>
            ),
          },

          // ---------------- INTERVIEW ----------------

          {
            label: "Interview",
            value: "interview",
            content: (
              <Section>
                {job.interviewPreps.map((prep) => (
                  <Panel key={prep.id}>
                    <p className="font-medium">Interview Prep</p>
                  </Panel>
                ))}
              </Section>
            ),
          },

          // ---------------- SUGGESTIONS ----------------

          {
            label: "Suggestions",
            value: "suggestions",
            content: (
              <Section>
                {job.versions.map((v) =>
                  v.suggestions?.map((s) => (
                    <Panel key={s.id}>
                      <p>{s.section}</p>
                    </Panel>
                  )),
                )}
              </Section>
            ),
          },
        ]}
      />
    </div>
  );
}
