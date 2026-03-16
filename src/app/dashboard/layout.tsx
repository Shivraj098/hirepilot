"use client";
import { LayoutDashboard, FileText, Briefcase } from "lucide-react";
import { ReactNode } from "react";
import MotionWrapper from "@/components/ui/motion-wrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* Sidebar */}
      <aside className=" w-64
    border-r
    border-border/60
    bg-background
    p-4
    flex
    flex-col
    gap-4">

        <div className="text-lg font-semibold tracking-tight px-2 py-1">
          HirePilot
        </div>

        <nav className="space-y-1 text-sm pt-2">

 <Link
  href="/dashboard"
  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
    pathname === "/dashboard"
      ? "bg-muted text-foreground font-medium border border-border/60"
      : "text-muted-foreground hover:bg-muted"
  }`}
>
  <LayoutDashboard className="w-4 h-4" />
  Dashboard
</Link>

  <Link
  href="/dashboard/resumes"
  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
    pathname.includes("/resumes")
      ? "bg-muted text-foreground font-medium border border-border/60"
      : "text-muted-foreground hover:bg-muted"
  }`}
>
  <FileText className="w-4 h-4" />
  Resumes
</Link>

 <Link
  href="/dashboard/jobs"
  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
    pathname.includes("/jobs")
      ? "bg-muted text-foreground font-medium border border-border/60"
      : "text-muted-foreground hover:bg-muted"
  }`}
>
  <Briefcase className="w-4 h-4" />
  Jobs
</Link>
</nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-14
    border-b
    border-border/60
    bg-background
    flex
    items-center
    justify-between
    px-6">

          <h1 className="text-sm font-semibold tracking-tight">
            Hirepilot Workspace
          </h1>

          <div className="text-sm text-muted-foreground">
            Resume Optimization Workspace
          </div>

        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-8">

          <div className="max-w-6xl mx-auto w-full">

            <MotionWrapper>
              {children}
            </MotionWrapper>

          </div>

        </main>

      </div>
    </div>
  );
}