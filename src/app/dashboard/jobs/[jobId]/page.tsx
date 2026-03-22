import PageHeader from "@/components/ui/page-header";
import Tabs from "@/components/ui/tabs";
import Panel from "@/components/ui/panel";
import Section from "@/components/ui/section";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateSkillGap } from "@/server/ai/skills/skill-gap";
import StatRow from "@/components/ui/stat-row";
import PanelHeader from "@/components/ui/panel-header";
import Progress from "@/components/ui/progress";
import { Tag } from "lucide-react";
import Badge from "@/components/ui/badge";

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

                    <Panel>
                      <PanelHeader title="Match Score" />

                      <StatRow
                        label="Score"
                        value={`${skillGap.matchPercentage}%`}
                      />

                      <Progress value={skillGap.matchPercentage} />
                    </Panel>
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
                  <>
                    <Panel>
                      <PanelHeader title="Missing Skills" />

                      <div className="flex flex-wrap gap-2">
                        {skillGap.missingSkills.map((s: string) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </div>
                    </Panel>
                    <Panel>
                      <PanelHeader title="Matched Skills" />

                      <div className="flex flex-wrap gap-2">
                        {skillGap.matchedSkills.map((s: string) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </div>
                    </Panel>
                  </>
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
                    <PanelHeader title={gap.skill} />

                    <Badge>{gap.priority}</Badge>

                    <StatRow label="Estimated time" value={gap.estimatedTime} />

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
            content: (<Section>

  {job.versions.map(v => {

    const ats = v.aTSResults?.[0];

    return (

      <Panel key={v.id}>

        <PanelHeader
          title={v.resume.title}
        />

        {ats && (

          <>
            <StatRow
              label="ATS"
              value={`${ats.score}%`}
            />

            <Progress value={ats.score} />
          </>

        )}

        <Badge>
          Version
        </Badge>

      </Panel>

    );

  })}

</Section>
            ),
          },

          // ---------------- INTERVIEW ----------------

          {
            label: "Interview",
            value: "interview",
            content: (<Section>

  {job.interviewPreps.map(prep => (

    <Panel key={prep.id}>

      <PanelHeader title="Interview Prep" />

      <StatRow
        label="Questions"
        value={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (prep.questions as any[])
            .length
        }
      />

      <StatRow
        label="Topics"
        value={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (prep.technicalTopics as any[])
            .length
        }
      />

      <Badge>
        AI Generated
      </Badge>

    </Panel>

  ))}

</Section>
            ),
          },

          // ---------------- SUGGESTIONS ----------------

          {
            label: "Suggestions",
            value: "suggestions",
            content: (<Section>

  {job.versions.map(v =>

    v.suggestions?.map(s => (

      <Panel key={s.id}>

        <PanelHeader
          title={s.section}
        />

        <pre className="text-xs">
          {JSON.stringify(
            s.suggestedContent,
            null,
            2
          )}
        </pre>

        <Badge>
          Suggestion
        </Badge>

      </Panel>

    ))

  )}

</Section>
            ),
          },
        ]}
      />
    </div>
  );
}
