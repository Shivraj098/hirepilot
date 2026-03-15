import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import {
  updateResumeSummary,
  addExperience,
  removeExperience,
  addSkill,
  removeSkill,
  addEducation,
  removeEducation,
  createTailoredVersionForJob,
} from "@/server/actions/resume.actions";
import { createJob, deleteJob } from "@/server/actions/job.actions";
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
    <div
      className="max-w-5xl
      mx-auto
      px-6
      py-10
      space-y-10"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {resume.title}
        </h1>

        <p className="text-sm text-muted-foreground">Base resume editor</p>
      </div>

      {/* ================= SUMMARY ================= */}

      <Card
        className=" p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Summary</h2>

          <p className="text-sm text-muted-foreground">
            Short professional overview used at the top of your resume.
          </p>
        </div>

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

          <div className="flex justify-end pt-2">
            <Button variant="primary">Save</Button>
          </div>
        </FormWithToast>
      </Card>
      {/* ================= SKILLS ================= */}
      {/* ================= SKILLS ================= */}

      <Card
        className="p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Highlight technologies and strengths relevant to your roles.
          </p>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No skills added yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="
           flex items-center gap-2
rounded-full
border border-border/70
bg-muted/50
px-3 py-1.5
text-sm
font-medium
transition-all
hover:bg-muted
hover:border-border
          "
              >
                <span className="font-medium">{skill}</span>

                <FormWithToast
                  successMessage="Skill removed"
                  action={async () => {
                    "use server";
                    await removeSkill(resumeId, index);
                  }}
                >
                  <Button
                    variant="ghost"
                    className="
    h-6
    px-2
    text-xs
    text-muted-foreground
    hover:text-destructive
  "
                  >
                    ×
                  </Button>
                </FormWithToast>
              </div>
            ))}
          </div>
        )}

        <FormWithToast
          successMessage="Skill added"
          action={async (formData) => {
            "use server";
            const skill = formData.get("skill") as string;
            if (!skill) return;
            await addSkill(resumeId, skill);
          }}
        >
          <div className="pt-4 border-t border-border flex gap-3 items-center">
            <Input
              name="skill"
              placeholder="Add skill (e.g., React)"
              className="max-w-sm"
            />

            <Button variant="primary">Add</Button>
          </div>
        </FormWithToast>
      </Card>
      {/* ================= EDUCATION ================= */}
      {/* ================= EDUCATION ================= */}

      <Card
        className=" p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Education</h2>
          <p className="text-sm text-muted-foreground">
            Academic background and foundational credentials.
          </p>
        </div>

        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No education added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div
                key={index}
                className="
            rounded-xl
border border-border/60
bg-muted/40
p-5
transition-all
hover:bg-muted/60
hover:border-border
          "
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">{edu.degree}</h3>

                    <p className="text-sm text-muted-foreground pt-1">
                      {edu.institution} — {edu.duration}
                    </p>
                  </div>

                  <FormWithToast
                    successMessage="Education removed"
                    action={async () => {
                      "use server";
                      await removeEducation(resumeId, index);
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="
    text-muted-foreground
    hover:text-destructive
    text-sm
  "
                    >
                      Remove
                    </Button>
                  </FormWithToast>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormWithToast
          successMessage="Education added"
          action={async (formData) => {
            "use server";

            await addEducation(resumeId, {
              institution: formData.get("institution") as string,
              degree: formData.get("degree") as string,
              duration: formData.get("duration") as string,
            });
          }}
        >
          <div className="pt-4 border-t border-border space-y-3">
            <Input name="degree" placeholder="Degree" />

            <Input name="institution" placeholder="Institution" />

            <Input name="duration" placeholder="Duration" />

            <div className="flex justify-end pt-2">
              <Button variant="primary">Add Education</Button>
            </div>
          </div>
        </FormWithToast>
      </Card>
      {/* ================= EXPERIENCE ================= */}
      {/* ================= EXPERIENCE ================= */}

      <Card
        className=" p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Experience</h2>
          <p className="text-sm text-muted-foreground">
            Professional roles and measurable impact.
          </p>
        </div>

        {experience.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No experience added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="rounded-xl
border border-border/60
bg-muted/40
p-5
space-y-2
transition-all
hover:bg-muted/60
hover:border-border"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">{exp.role}</h3>

                    <p className="text-sm text-muted-foreground">
                      {exp.company} — {exp.duration}
                    </p>
                  </div>

                  <FormWithToast
                    successMessage="Experience removed"
                    action={async () => {
                      "use server";
                      await removeExperience(resumeId, index);
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="
    text-muted-foreground
    hover:text-destructive
    text-sm
  "
                    >
                      Remove
                    </Button>
                  </FormWithToast>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <FormWithToast
          successMessage="Experience added"
          action={async (formData) => {
            "use server";

            await addExperience(resumeId, {
              company: formData.get("company") as string,
              role: formData.get("role") as string,
              duration: formData.get("duration") as string,
              description: formData.get("description") as string,
            });
          }}
        >
          <div className="pt-4 border-t border-border space-y-3">
            <Input name="role" placeholder="Role" />

            <Input name="company" placeholder="Company" />

            <Input name="duration" placeholder="Duration" />

            <Textarea name="description" placeholder="Description" rows={4} />

            <div className="flex justify-end pt-2">
              <Button variant="primary">Add Experience</Button>
            </div>
          </div>
        </FormWithToast>
      </Card>
      {/* ================= VERSION HISTORY ================= */}
      {/* ================= VERSION HISTORY ================= */}

      <Card
        className=" p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Version History
          </h2>
          <p className="text-sm text-muted-foreground">
            Tailored resumes generated for different jobs.
          </p>
        </div>

        {tailoredVersions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">
            No tailored versions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tailoredVersions.map((version) => (
              <div
                key={version.id}
                className="
        rounded-xl
border border-border/60
bg-muted/40
p-5
flex justify-between items-start gap-4
transition-all
hover:bg-muted/60
hover:border-border
          "
              >
                <div className="space-y-1">
                  <p className="font-semibold">
                    Tailored for {version.job?.title}
                  </p>

                  <p className="text-sm text-muted-foreground pt-1">
                    {version.job?.company}
                    {version.job?.location && ` — ${version.job.location}`}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ================= CREATE TAILORED ================= */}
      {/* ================= CREATE TAILORED ================= */}

      <Card
        className=" p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1 ,max-w-md">
          <h2 className="text-lg font-semibold tracking-tight">
            Create Tailored Version
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate a resume version customized for a selected job.
          </p>
        </div>

        <FormWithToast
          successMessage="Tailored version created"
          action={async (formData) => {
            "use server";

            const jobId = formData.get("jobId") as string;
            if (!jobId) return;

            await createTailoredVersionForJob(resumeId, jobId);
          }}
        >
          <div className="space-y-4 pt-2">
            <Select name="jobId" required className="max-w-md">
              <option value="">Select a job to tailor resume</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} at {job.company}
                </option>
              ))}
            </Select>

            <div className="flex justify-end pt-2">
              <Button variant="primary" className="min-w-[180px]">
                Create Tailored Version
              </Button>
            </div>
          </div>
        </FormWithToast>
      </Card>
      {/* ================= JOBS ================= */}
      {/* ================= JOBS ================= */}

      <Card
        className="p-8
    space-y-6
    rounded-2xl
    border-border/60
    shadow-sm
    bg-background"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Jobs</h2>
          <p className="text-sm text-muted-foreground ">
            Track roles you’re applying to and tailor resumes accordingly.
          </p>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            No jobs added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="
            rounded-xl
border border-border/60
bg-muted/40
p-5
flex justify-between items-start gap-4
transition-all
hover:bg-muted/60
hover:border-border
          "
              >
                <div className="space-y-1">
                  <h3 className="font-semi-bold text-base">{job.title}</h3>

                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>

                <FormWithToast
                  successMessage="Job deleted"
                  action={async () => {
                    "use server";
                    await deleteJob(job.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    className="text-muted-foreground
    hover:text-destructive
    text-sm"
                  >
                    Delete
                  </Button>
                </FormWithToast>
              </div>
            ))}
          </div>
        )}

        <FormWithToast
          successMessage="Job created"
          action={async (formData) => {
            "use server";

            await createJob({
              title: formData.get("title") as string,
              company: formData.get("company") as string,
              description: formData.get("description") as string,
              location: formData.get("location") as string,
              jobLink: formData.get("jobLink") as string,
            });
          }}
        >
          <div className="pt-4 border-t border-border space-y-3">
            <Input name="title" placeholder="Job Title" />
            <Input name="company" placeholder="Company" />
            <Input name="location" placeholder="Location" />
            <Input name="jobLink" placeholder="Job Link" />

            <Textarea
              name="description"
              placeholder="Job Description"
              rows={4}
            />

            <div className="flex justify-end pt-2">
              <Button variant="primary">Add Job</Button>
            </div>
          </div>
        </FormWithToast>
      </Card>
    </div>
  );
}
