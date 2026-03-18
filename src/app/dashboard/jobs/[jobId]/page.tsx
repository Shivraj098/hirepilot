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
    <div className="p-8 max-w-4xl space-y-12">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">{job.title}</h1>

        <p className="text-sm text-muted-foreground">
          {job.company}
          {job.location && ` — ${job.location}`}
        </p>

        {job.jobLink && (
          <a
            href={job.jobLink}
            target="_blank"
            className="
        text-sm
        text-accent
        hover:underline
      "
          >
            View Job Posting
          </a>
        )}
      </div>
      {/* JOB DESCRIPTION */}
      <Card className="p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Job Description
          </h2>
          <p className="text-sm text-muted-foreground">
            Full description of the role you are targeting.
          </p>
        </div>

        <div
          className="
      rounded-xl
      border border-border
      bg-muted
      p-5
      text-sm
      whitespace-pre-wrap
      leading-relaxed
    "
        >
          {job.description}
        </div>
      </Card>
      {/* SKILL GAP ANALYSIS */}
      {skillGap && (
        <Card className="p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Skill Gap Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Comparison between your resume and job requirements.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Match Score</p>

            <span
              className="
      text-sm
      font-semibold
      rounded-full
      border border-border
      bg-background
      px-3 py-1
    "
            >
              {skillGap.matchPercentage}%
            </span>
          </div>
          <div className="border-t border-border" />

          {/* MATCHED */}

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Matched Skills</h3>

            {skillGap.matchedSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No matching skills found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillGap.matchedSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="
                rounded-full
                border border-border
                bg-muted
                px-3 py-1.5
                text-sm
              "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* MISSING */}

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Missing Skills</h3>

            {skillGap.missingSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gaps detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillGap.missingSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="
                rounded-full
                border border-border
                bg-muted
                px-3 py-1.5
                text-xs
                font-medium
              "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* SKILL GAP ROADMAP */}

      {job.skillGaps && job.skillGaps.length > 0 && (
        <Card className="p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Skill Improvement Roadmap
            </h2>
            <p className="text-sm text-muted-foreground">
              Recommended skills to learn to better match this role.
            </p>
          </div>

          <div className="space-y-3">
            {job.skillGaps.map((gap) => (
              <div
                key={gap.id}
                className="
            rounded-xl
            border border-border
            bg-muted
            p-5
            space-y-2
            transition-colors
            hover:bg-muted/80
          "
              >
                <div className="flex justify-between items-center gap-4">
                  <p className="font-medium">{gap.skill}</p>

                  <span
                    className="
                text-xs
                font-medium
                rounded-full
                border border-border
                bg-background
                px-3 py-1
              "
                  >
                    {gap.priority}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Estimated Time: {gap.estimatedTime}
                </p>

                <p className="text-sm">{gap.reasoning}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Generate AI Button */}
      <Card className="p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            AI Resume Tailoring
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate a tailored resume based on this job description.
          </p>
        </div>

        <form
          action={async () => {
            "use server";

            const resume = await prisma.resume.findFirst({
              where: { userId: user.id },
              orderBy: { createdAt: "desc" },
            });

            if (!resume) return;

            const { createTailoredVersionWithAI } =
              await import("@/server/actions/interview.action");

            await createTailoredVersionWithAI(resume.id, job.id);
          }}
        >
          <div className="flex justify-end">
            <Button variant="primary">Generate Tailored Resume with AI</Button>
          </div>
        </form>
      </Card>
      {/* TAILORED VERSIONS */}
      <Card className="p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Tailored Resume Versions
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-generated resume versions for this job.
          </p>
        </div>

        {job.versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tailored resumes created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {job.versions.map((version) => {
              const ats = version.aTSResults?.[0];

              return (
                <div
                  key={version.id}
                  className="
              rounded-xl
              border border-border
              bg-muted
              p-5
              space-y-3
              transition-colors
              hover:bg-muted/80
            "
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Resume: {version.resume.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(version.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {ats && (
                      <div
                        className="
                    text-sm
                    rounded-full
                    border border-border
                    bg-background
                    px-3 py-1
                    font-medium
                  "
                      >
                        <span
                          className="
    text-xs
    font-medium
    rounded-full
    border border-border
    bg-background
    px-3 py-1
  "
                        >
                          ATS {ats.score}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Interview Preparation */}
                  {job.interviewPreps.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium">
                        Interview Preparation
                      </h3>

                      {job.interviewPreps.map((prep) => {
                        const questions = prep.questions as string[];
                        const starDrafts = prep.starDrafts as string[];
                        const technicalTopics =
                          prep.technicalTopics as string[];

                        return (
                          <div
                            key={prep.id}
                            className="
            rounded-lg
            border border-border
            bg-background
            p-5
            space-y-4
          "
                          >
                            {/* Technical */}

                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                Technical Topics
                              </h4>

                              <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                                {technicalTopics.map((topic, index) => (
                                  <li key={index}>{topic}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Questions */}

                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                Interview Questions
                              </h4>

                              <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                                {questions.map((question, index) => (
                                  <li key={index}>{question}</li>
                                ))}
                              </ul>
                            </div>

                            {/* STAR */}

                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                STAR Answer Framework
                              </h4>

                              <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                                {starDrafts.map((draft, index) => (
                                  <li key={index}>{draft}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form
                    action={async () => {
                      "use server";
                      await regenerateInterviewPrep(job.id);
                    }}
                  >
                    <div className="mt-4">
                      <Button variant="secondary">
                        Regenerate Interview Prep
                      </Button>
                    </div>
                  </form>
                  {/* AI Suggestions */}
                  {version.suggestions?.filter((s) => !s.applied).length >
                    0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium">AI Suggestions</h3>

                      {version.suggestions
                        .filter((s) => !s.applied)
                        .map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="
            rounded-lg
            border border-border
            bg-background
            p-4
            space-y-3
          "
                          >
                            <p className="text-sm font-medium capitalize">
                              Section: {suggestion.section}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Suggested Update:
                            </p>

                            <pre
                              className="
              text-xs
              bg-muted
              p-3
              rounded-md
              overflow-x-auto
            "
                            >
                              {JSON.stringify(
                                suggestion.suggestedContent,
                                null,
                                2,
                              )}
                            </pre>

                            <form
                              action={async () => {
                                "use server";
                                await applySuggestion(suggestion.id);
                              }}
                            >
                              <Button variant="primary" className="mt-2">
                                Apply Suggestion
                              </Button>
                            </form>
                          </div>
                        ))}
                    </div>
                  )}

                  {ats && (
                    <div className="mt-6 space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Matched Skills</p>

                        <div className="flex flex-wrap gap-2">
                          {(ats.matchedKeywords as string[]).map((skill) => (
                            <span
                              key={skill}
                              className="
                rounded-full
                border border-border
                bg-muted
                px-2 py-1
                text-xs
              "
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Missing Skills</p>

                        <div className="flex flex-wrap gap-2">
                          {(ats.missingKeywords as string[]).map((skill) => (
                            <span
                              key={skill}
                              className="
                rounded-full
                border border-border
                bg-muted
                px-2 py-1
                text-xs
              "
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
