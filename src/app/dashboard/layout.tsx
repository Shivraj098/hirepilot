import { ReactNode } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import PageContainer from "@/components/layout/page-container";
import MotionWrapper from "@/components/ui/motion-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
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