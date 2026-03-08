"use client";

import { ReactNode } from "react";
import MotionWrapper from "@/components/ui/motion-wrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname(); // ✅ MUST be here

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 flex">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200/70 bg-white/60 backdrop-blur-xl p-6">
        <nav className="space-y-2 text-sm">
          
          <Link
            href="/dashboard"
            className={`block px-4 py-2.5 rounded-xl transition-colors font-medium ${
              pathname === "/dashboard"
                ? "bg-neutral-900 text-white"
                : "hover:bg-neutral-100 text-neutral-700"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/resumes"
            className={`block px-4 py-2.5 rounded-xl transition-colors ${
              pathname.includes("/dashboard/")
                ? "bg-neutral-900 text-white"
                : "hover:bg-neutral-100 text-neutral-700"
            }`}
          >
            Resumes
          </Link>

          <Link
            href="/dashboard/jobs"
            className={`block px-4 py-2.5 rounded-xl transition-colors ${
              pathname.includes("/jobs")
                ? "bg-neutral-900 text-white"
                : "hover:bg-neutral-100 text-neutral-700"
            }`}
          >
            Jobs
          </Link>

        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 border-b border-neutral-200/70 bg-white/60 backdrop-blur-xl flex items-center justify-between px-10">
          <h1 className="text-lg font-medium tracking-tight">
            Dashboard
          </h1>

          <div className="text-sm text-neutral-500">
            Resume Optimization Workspace
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-12 py-12">
          <div className="max-w-6xl mx-auto">
            <MotionWrapper>
              {children}
            </MotionWrapper>
          </div>
        </main>

      </div>
    </div>
  );
}