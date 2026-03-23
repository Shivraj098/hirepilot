import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

import PageHeader from "@/components/ui/page-header";
import Section from "@/components/ui/section";
import Panel from "@/components/ui/panel";
import PanelHeader from "@/components/ui/panel-header";
import Badge from "@/components/ui/badge";

import Link from "next/link";

export default async function ResumesPage() {
  const user = await getCurrentUser();

  if (!user?.id) return null;

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: { versions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">

      <PageHeader
        title="Resumes"
        description="Manage your resumes"
      />

      <Section>

        {resumes.length === 0 && (
          <Panel>
            No resumes yet
          </Panel>
        )}

        {resumes.map((r) => (

          <Link
            key={r.id}
           href={`/dashboard/resumes/${r.id}`}
          >

            <Panel>

              <PanelHeader
                title={r.title}
              />

              <Badge>
                {r.versions.length} versions
              </Badge>

            </Panel>

          </Link>

        ))}

      </Section>

    </div>
  );
}