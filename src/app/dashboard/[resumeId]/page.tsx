import Badge from "@/components/ui/badge";
import Progress from "@/components/ui/progress";
import PanelHeader from "@/components/ui/panel-header";
import StatRow from "@/components/ui/stat-row";
import Timeline from "@/components/ui/timeline";
import Tag from "@/components/ui/tag";

import PageHeader from "@/components/ui/page-header";
import Tabs from "@/components/ui/tabs";
import Panel from "@/components/ui/panel";
import Section from "@/components/ui/section";
import Divider from "@/components/ui/divider";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import {
  updateResumeSummary,
  createTailoredVersionForJob,
  addSkill,
  removeSkill,
  addEducation,
  removeEducation,
  addExperience,
  removeExperience,
} from "@/server/actions/resume.actions";
import FormWithToast from "@/components/ui/form-with-toast";

interface Props {
  params: Promise<{
    resumeId: string;
  }>;
}

export default async function ResumePage({ params }: Props) {
  const { resumeId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/signin");
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    include: {
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          job: true,
        },
      },
    },
  });

  if (!resume) {
    redirect("/dashboard");
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const baseVersion = resume.versions.find((v) => v.versionType === "BASE");

  if (!baseVersion) {
    throw new Error("Base version missing");
  }

  const tailoredVersions = resume.versions.filter(
    (v) => v.versionType === "TAILORED",
  );

  const content = (baseVersion.content ?? {}) as {
    summary?: string;
    experience?: Array<{
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
    skills?: string[];
    education?: Array<{
      institution: string;
      degree: string;
      duration: string;
    }>;
  };

  const experience = content.experience ?? [];
  const skills = content.skills ?? [];
  const education = content.education ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={resume.title} description="Base resume editor" />

      <Tabs
        defaultValue="editor"
        tabs={[
          {
            label: "Editor",
            value: "editor",
            content: (
              <Section>
                {/* SUMMARY */}

                <Panel>
                  <PanelHeader title="Summary" />

                  <FormWithToast
                    successMessage="Summary updated"
                    action={async (formData) => {
                      "use server";
                      const summary = formData.get("summary") as string;

                      await updateResumeSummary(resumeId, summary);
                    }}
                  >
                    <Textarea
                      name="summary"
                      defaultValue={content.summary ?? ""}
                      rows={6}
                    />

                    <div className="flex justify-end pt-4">
                      <Button>Save</Button>
                    </div>
                  </FormWithToast>
                </Panel>

                {/* SKILLS */}

                <Panel>
                  <h2 className="font-semibold mb-4">Skills</h2>

                  {skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No skills added
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <div
                          key={i}
                          className="
              flex items-center gap-2
              px-3 py-1
              border border-border
              rounded-full
              text-sm
            "
                        >
                          {skill}

                          <FormWithToast
                            successMessage="Removed"
                            action={async () => {
                              "use server";
                              await removeSkill(resumeId, i);
                            }}
                          >
                            <button>×</button>
                          </FormWithToast>
                        </div>
                      ))}
                    </div>
                  )}

                  <Divider />

                  <FormWithToast
                    successMessage="Skill added"
                    action={async (fd) => {
                      "use server";

                      const s = fd.get("skill") as string;

                      await addSkill(resumeId, s);
                    }}
                  >
                    <div className="flex gap-2">
                      <Input name="skill" />

                      <Button>Add</Button>
                    </div>
                  </FormWithToast>
                </Panel>

                {/* EDUCATION */}

                <Panel>
                  <PanelHeader title="Education" />

                  {education.map((edu, i) => (
                    <div
                      key={i}
                      className="
          border border-border
          rounded-xl
          p-4
          mb-2
        "
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{edu.degree}</p>

                          <p className="text-sm text-muted-foreground">
                            {edu.institution}
                          </p>
                        </div>

                        <FormWithToast
                          successMessage="Removed"
                          action={async () => {
                            "use server";
                            await removeEducation(resumeId, i);
                          }}
                        >
                          <Button variant="ghost">Remove</Button>
                        </FormWithToast>
                      </div>
                    </div>
                  ))}

                  <FormWithToast
                    successMessage="Added"
                    action={async (fd) => {
                      "use server";

                      await addEducation(resumeId, {
                        degree: fd.get("degree") as string,
                        institution: fd.get("institution") as string,
                        duration: fd.get("duration") as string,
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Input name="degree" />
                      <Input name="institution" />
                      <Input name="duration" />

                      <Button>Add Education</Button>
                    </div>
                  </FormWithToast>
                </Panel>

                {/* EXPERIENCE */}

                <Panel>
                  <PanelHeader title="Experience" />

                  {experience.map((exp, i) => (
                    <div
                      key={i}
                      className="
          border border-border
          rounded-xl
          p-4
          mb-2
        "
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{exp.role}</p>

                          <p className="text-sm text-muted-foreground">
                            {exp.company}
                          </p>
                        </div>

                        <FormWithToast
                          successMessage="Removed"
                          action={async () => {
                            "use server";
                            await removeExperience(resumeId, i);
                          }}
                        >
                          <Button variant="ghost">Remove</Button>
                        </FormWithToast>
                      </div>

                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                  ))}

                  <FormWithToast
                    successMessage="Added"
                    action={async (fd) => {
                      "use server";

                      await addExperience(resumeId, {
                        role: fd.get("role") as string,
                        company: fd.get("company") as string,
                        duration: fd.get("duration") as string,
                        description: fd.get("description") as string,
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Input name="role" />
                      <Input name="company" />
                      <Input name="duration" />
                      <Textarea name="description" />

                      <Button>Add Experience</Button>
                    </div>
                  </FormWithToast>
                </Panel>
              </Section>
            ),
          },

          {
            label: "Versions",
            value: "versions",
            content: (
              <Section>
                <Panel>
                  <PanelHeader title="Version History" />

                  {tailoredVersions.length === 0 ? (
                    <p>No versions</p>
                  ) : (
                    <Timeline
                      items={tailoredVersions.map((v) => ({
                        id: v.id,
                        label: `Tailored for ${v.job?.title}`,
                        time: new Date(v.createdAt).toLocaleString(),
                      }))}
                    />
                  )}
                </Panel>
              </Section>
            ),
          },

          {
            label: "Tailoring",
            value: "tailor",
            content: (
              <Section>
                <Panel>
                  <h2 className="font-semibold mb-4">
                    Create Tailored Version
                  </h2>

                  <FormWithToast
                    successMessage="Created"
                    action={async (fd) => {
                      "use server";

                      const jobId = fd.get("jobId") as string;

                      await createTailoredVersionForJob(resumeId, jobId);
                    }}
                  >
                    <Select name="jobId">
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                    </Select>

                    <div className="pt-4">
                      <Button>Create</Button>
                    </div>
                  </FormWithToast>
                </Panel>
              </Section>
            ),
          },

          {
            label: "Jobs",
            value: "jobs",
            content: (
              <Section>
                <Panel>
                  <h2 className="font-semibold mb-4">Jobs</h2>

                  {jobs.map((j) => (
                    <div
                      key={j.id}
                      className="
                    border
                    border-border
                    rounded-xl
                    p-3
                    mb-2
                  "
                    >
                      {j.title}
                    </div>
                  ))}
                </Panel>
              </Section>
            ),
          },
          {
            label: "ATS",
            value: "ats",
            content: (
              <Section>
                <Panel>
                  <PanelHeader title="ATS Score" />

                  <StatRow label="Score" value="Coming soon" />

                  <Progress value={40} />
                </Panel>

                <Panel>
                  <PanelHeader title="Matched Skills" />

                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <Tag key={i}>{s}</Tag>
                    ))}
                  </div>
                </Panel>
              </Section>
            ),
          },
          {
            label: "Skills",
            value: "skills",
            content: (
              <Section>
                <Panel>
                  <PanelHeader title="Skills Overview" />

                  {skills.map((s, i) => (
                    <div key={i} className="flex justify-between mb-2">
                      <span>{s}</span>

                      <Badge>Skill</Badge>
                    </div>
                  ))}
                </Panel>
              </Section>
            ),
          },
        ]}
      />
    </div>
  );
}
