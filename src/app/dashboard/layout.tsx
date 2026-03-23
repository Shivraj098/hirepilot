import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import PageContainer from "@/components/layout/page-container";
import MotionWrapper from "@/components/ui/motion-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <DashboardShell>
      <PageContainer>
        <MotionWrapper>
          {children}
        </MotionWrapper>
      </PageContainer>
    </DashboardShell>
  );
}