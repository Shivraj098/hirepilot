import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import Tabs from "@/components/ui/tabs";
import Panel from "@/components/ui/panel";
import Section from "@/components/ui/section";
import Badge from "@/components/ui/badge";
import Progress from "@/components/ui/progress";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import {
  Briefcase,
  Sparkles,
  BookOpen,
  Code2,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import RunJobAnalysisButton from "@/components/jobs/run-job-analysis-button";

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) redirect("/signin");

  // Fetch job without include — Prisma Accelerate type fix
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!job) redirect("/dashboard/jobs");

  // Fetch all relations separately
  const [
    skillGaps,
    interviewPreps,
    jobAnalyses,
    matchResults,
    versions,
  ] = await Promise.all([
    prisma.skillGap.findMany({
      where: { jobId },
      orderBy: { priority: "asc" },
    }),
    prisma.interviewPrep.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    prisma.jobAnalysis.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    prisma.matchResult.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    prisma.resumeVersion.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Fetch version details separately
  const versionsWithDetails = await Promise.all(
    versions.map(async (v) => {
      const [resume, aTSResults, suggestions] = await Promise.all([
        prisma.resume.findUnique({ where: { id: v.resumeId } }),
        prisma.aTSResult.findMany({ where: { resumeVersionId: v.id } }),
        prisma.aISuggestion.findMany({
          where: { resumeVersionId: v.id, applied: false },
          take: 10,
        }),
      ]);
      return { ...v, resume, aTSResults, suggestions };
    })
  );

  const latestPrep = interviewPreps[0] ?? null;
  const latestMatch = matchResults[0] ?? null;
  const latestAnalysis = jobAnalyses[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.company}${job.location ? ` — ${job.location}` : ""}`}
        actions={
          <div className="flex gap-2">
            {job.jobLink && (
              <Link href={job.jobLink} target="_blank">
                <Badge variant="outline">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Posting
                </Badge>
              </Link>
            )}
            <Badge
              variant={
                job.status === "OFFER"
                  ? "success"
                  : job.status === "INTERVIEW"
                  ? "warning"
                  : job.status === "REJECTED"
                  ? "danger"
                  : job.status === "APPLIED"
                  ? "info"
                  : "default"
              }
              dot
            >
              {job.status}
            </Badge>
          </div>
        }
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          // ── OVERVIEW ──
          {
            label: "Overview",
            value: "overview",
            content: (
              <Section>
                <Panel>
                  <PanelHeader title="Job Description" />
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </div>
                </Panel>

                <Panel>
                  <div className="flex items-center justify-between mb-4">
                    <PanelHeader title="Match Score" />
                    <RunJobAnalysisButton jobId={jobId} />
                  </div>

                  {latestMatch ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Score
                        </span>
                        <span className="text-2xl font-bold">
                          {latestMatch.matchScore ?? 0}%
                        </span>
                      </div>
                      <Progress
                        value={latestMatch.matchScore ?? 0}
                        showLabel
                        size="lg"
                      />

                      {latestMatch.fitLevel && (
                        <Badge
                          variant={
                            latestMatch.fitLevel === "Strong" ||
                            latestMatch.fitLevel === "Perfect"
                              ? "success"
                              : latestMatch.fitLevel === "Good"
                              ? "info"
                              : latestMatch.fitLevel === "Average"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {latestMatch.fitLevel} Fit
                        </Badge>
                      )}

                      {latestMatch.reason && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {latestMatch.reason}
                        </p>
                      )}

                      {latestMatch.shouldApply !== null && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-xl border ${
                            latestMatch.shouldApply
                              ? "bg-[--success]/10 border-[--success]/20 text-[--success]"
                              : "bg-destructive/10 border-destructive/20 text-destructive"
                          }`}
                        >
                          {latestMatch.shouldApply ? (
                            <CheckCircle className="w-4 h-4 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 shrink-0" />
                          )}
                          <span className="text-sm font-medium">
                            {latestMatch.shouldApply
                              ? "Recommended to apply"
                              : "Improve resume before applying"}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Sparkles className="w-5 h-5" />}
                      title="No match analysis yet"
                      description="Run AI analysis to see how well your resume matches this job."
                      action={<RunJobAnalysisButton jobId={jobId} />}
                      size="sm"
                    />
                  )}
                </Panel>

                {latestAnalysis && (
                  <Panel>
                    <PanelHeader title="Job Intelligence" />
                    <div className="grid grid-cols-2 gap-3">
                      {latestAnalysis.roleCategory && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Role Category
                          </p>
                          <p className="text-sm font-medium">
                            {latestAnalysis.roleCategory}
                          </p>
                        </div>
                      )}
                      {latestAnalysis.requiredLevel && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Required Level
                          </p>
                          <p className="text-sm font-medium">
                            {latestAnalysis.requiredLevel}
                          </p>
                        </div>
                      )}
                      {latestAnalysis.difficulty && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Difficulty
                          </p>
                          <p className="text-sm font-medium">
                            {latestAnalysis.difficulty}
                          </p>
                        </div>
                      )}
                      {latestAnalysis.domain && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Domain
                          </p>
                          <p className="text-sm font-medium">
                            {latestAnalysis.domain}
                          </p>
                        </div>
                      )}
                    </div>
                  </Panel>
                )}
              </Section>
            ),
          },

          // ── SKILL GAP ──
          {
            label: "Skill Gap",
            value: "gap",
            badge: skillGaps.length,
            content: (
              <Section>
                {skillGaps.length === 0 ? (
                  <Panel>
                    <EmptyState
                      icon={<Code2 className="w-6 h-6" />}
                      title="No skill gap analysis yet"
                      description="Run AI analysis to identify skills you need for this role."
                      action={<RunJobAnalysisButton jobId={jobId} />}
                    />
                  </Panel>
                ) : (
                  <Panel>
                    <PanelHeader title="Missing Skills" />
                    <div className="flex flex-wrap gap-2">
                      {skillGaps
                        .filter((g) => g.priority === "HIGH")
                        .map((g) => (
                          <Badge key={g.id} variant="danger" dot>
                            {g.skill}
                          </Badge>
                        ))}
                      {skillGaps
                        .filter((g) => g.priority === "MEDIUM")
                        .map((g) => (
                          <Badge key={g.id} variant="warning" dot>
                            {g.skill}
                          </Badge>
                        ))}
                      {skillGaps
                        .filter((g) => g.priority === "LOW")
                        .map((g) => (
                          <Badge key={g.id} variant="default" dot>
                            {g.skill}
                          </Badge>
                        ))}
                    </div>
                  </Panel>
                )}
              </Section>
            ),
          },

          // ── ROADMAP ──
          {
            label: "Roadmap",
            value: "roadmap",
            badge: skillGaps.length,
            content: (
              <Section>
                {skillGaps.length === 0 ? (
                  <Panel>
                    <EmptyState
                      icon={<BookOpen className="w-6 h-6" />}
                      title="No roadmap yet"
                      description="Run AI analysis to get a personalized learning roadmap."
                      action={<RunJobAnalysisButton jobId={jobId} />}
                    />
                  </Panel>
                ) : (
                  skillGaps.map((gap) => (
                    <Panel key={gap.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{gap.skill}</p>
                            <Badge
                              variant={
                                gap.priority === "HIGH"
                                  ? "danger"
                                  : gap.priority === "MEDIUM"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {gap.priority}
                            </Badge>
                            {gap.difficulty && (
                              <Badge variant="outline">
                                {gap.difficulty}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {gap.reasoning}
                          </p>
                          {gap.learningLink && (
                            <Link
                              href={gap.learningLink}
                              target="_blank"
                              className="text-xs text-[--ai] hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Learning resource
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">{gap.estimatedTime}</span>
                        </div>
                      </div>
                    </Panel>
                  ))
                )}
              </Section>
            ),
          },

          // ── VERSIONS ──
          {
            label: "Versions",
            value: "versions",
            badge: versionsWithDetails.length,
            content: (
              <Section>
                {versionsWithDetails.length === 0 ? (
                  <Panel>
                    <EmptyState
                      icon={<Briefcase className="w-6 h-6" />}
                      title="No tailored versions yet"
                      description="Create a tailored resume version for this job."
                    />
                  </Panel>
                ) : (
                  versionsWithDetails.map((v) => {
                    const ats = v.aTSResults?.[0];
                    return (
                      <Panel key={v.id}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-sm">
                              {v.resume?.title ?? "Resume"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {v.label ?? v.versionType}
                            </p>
                          </div>
                          <Badge
                            variant={
                              v.versionType === "TAILORED" ? "ai" : "default"
                            }
                          >
                            {v.versionType}
                          </Badge>
                        </div>
                        {ats && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>ATS Score</span>
                              <span className="font-medium text-foreground">
                                {ats.score}%
                              </span>
                            </div>
                            <Progress value={ats.score} size="sm" />
                          </div>
                        )}
                        {v.suggestions && v.suggestions.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {v.suggestions.length} AI suggestion
                            {v.suggestions.length !== 1 ? "s" : ""} available
                          </p>
                        )}
                      </Panel>
                    );
                  })
                )}
              </Section>
            ),
          },

          // ── INTERVIEW ──
          {
            label: "Interview",
            value: "interview",
            content: (
              <Section>
                {!latestPrep ? (
                  <Panel>
                    <EmptyState
                      icon={<Star className="w-6 h-6" />}
                      title="No interview prep yet"
                      description="Run AI analysis to get tailored interview questions and STAR method drafts."
                      action={<RunJobAnalysisButton jobId={jobId} />}
                    />
                  </Panel>
                ) : (
                  <>
                    <Panel>
                      <PanelHeader title="Interview Questions" />
                      <div className="space-y-3">
                        {(latestPrep.questions as string[]).map((q, i) => (
                          <div
                            key={i}
                            className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                          >
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-foreground">{q}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    {Array.isArray(latestPrep.starDrafts) &&
                      (latestPrep.starDrafts as string[]).length > 0 && (
                        <Panel variant="ai">
                          <PanelHeader title="STAR Method Drafts" />
                          <div className="space-y-3">
                            {(latestPrep.starDrafts as string[]).map(
                              (draft, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-xl bg-background/50 border border-[--ai-border] text-sm text-muted-foreground"
                                >
                                  {draft}
                                </div>
                              )
                            )}
                          </div>
                        </Panel>
                      )}

                    {Array.isArray(latestPrep.technicalTopics) &&
                      (latestPrep.technicalTopics as string[]).length > 0 && (
                        <Panel>
                          <PanelHeader title="Technical Topics to Study" />
                          <div className="flex flex-wrap gap-2">
                            {(latestPrep.technicalTopics as string[]).map(
                              (topic, i) => (
                                <Badge key={i} variant="info">
                                  {topic}
                                </Badge>
                              )
                            )}
                          </div>
                        </Panel>
                      )}
                  </>
                )}
              </Section>
            ),
          },

          // ── SUGGESTIONS ──
          {
            label: "Suggestions",
            value: "suggestions",
            content: (
              <Section>
                {versionsWithDetails.flatMap((v) => v.suggestions).length ===
                0 ? (
                  <Panel>
                    <EmptyState
                      icon={<Sparkles className="w-6 h-6" />}
                      title="No suggestions yet"
                      description="Create a tailored version to get AI improvement suggestions."
                    />
                  </Panel>
                ) : (
                  versionsWithDetails.flatMap((v) =>
                    v.suggestions.map((s) => (
                      <Panel key={s.id} variant="ai">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="ai">{s.section}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {typeof s.suggestedContent === "string"
                                ? s.suggestedContent
                                : JSON.stringify(s.suggestedContent)}
                            </p>
                          </div>
                        </div>
                      </Panel>
                    ))
                  )
                )}
              </Section>
            ),
          },
        ]}
      />
    </div>
  );
}