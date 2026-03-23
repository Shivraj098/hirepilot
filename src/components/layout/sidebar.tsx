"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase } from "lucide-react";
import NavItem from "./nav-item";
import Logo from "./logo";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
      w-64
      border-r
      border-border/60
      bg-background
      flex
      flex-col
      p-4
      gap-4
    "
    >
      <Logo />

      <nav className="space-y-1 pt-2">

        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          active={pathname === "/dashboard"}
        >
          Dashboard
        </NavItem>

        <NavItem
          href="/dashboard/resumes"
          icon={<FileText className="w-4 h-4" />}
          active={pathname.includes("/resumes")}
        >
          Resumes
        </NavItem>

        <NavItem
          href="/dashboard/jobs"
          icon={<Briefcase className="w-4 h-4" />}
          active={pathname.includes("/jobs")}
        >
          Jobs
        </NavItem>

      </nav>
    </aside>
  );
}