import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}