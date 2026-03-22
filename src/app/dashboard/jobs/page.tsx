import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

import Tabs from "@/components/ui/tabs";
import Section from "@/components/ui/section";
import Panel from "@/components/ui/panel";
import PanelHeader from "@/components/ui/panel-header";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/ui/page-header";

import PipelineColumn from "@/components/jobs/pipeline-column";

export default async function JobsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // -------- pipeline groups --------

  const applied = jobs.filter(
    (j) => j.status === "APPLIED"
  );

  const interview = jobs.filter(
    (j) => j.status === "INTERVIEW"
  );

  const offer = jobs.filter(
    (j) => j.status === "OFFER"
  );

  const rejected = jobs.filter(
    (j) => j.status === "REJECTED"
  );

  // -------- pipeline UI --------

  const pipelineUI = (
    <Section>
      <div className="grid gap-4 lg:grid-cols-4">

        <PipelineColumn
          title="Applied"
          jobs={applied}
        />

        <PipelineColumn
          title="Interview"
          jobs={interview}
        />

        <PipelineColumn
          title="Offer"
          jobs={offer}
        />

        <PipelineColumn
          title="Rejected"
          jobs={rejected}
        />

      </div>
    </Section>
  );

  return (
    <div className="space-y-6">

      <PageHeader
        title="Jobs"
        description="Track job applications"
      />

      <Tabs
        defaultValue="list"
        tabs={[

          // ---------- LIST ----------

          {
            label: "List",
            value: "list",
            content: (

              <Section>

                {jobs.map((job) => (

                  <Panel key={job.id}>

                    <PanelHeader
                      title={job.title}
                    />

                    <Badge>
                      {job.status}
                    </Badge>

                  </Panel>

                ))}

              </Section>

            ),
          },

          // ---------- PIPELINE ----------

          {
            label: "Pipeline",
            value: "pipeline",
            content: pipelineUI,
          },

        ]}
      />

    </div>
  );
}