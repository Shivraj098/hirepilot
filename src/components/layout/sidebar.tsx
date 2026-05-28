"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import NavItem from "./nav-item";
import Logo from "./logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    exact: true,
  },
  {
    href: "/dashboard/resumes",
    label: "Resumes",
    icon: <FileText className="w-4 h-4" />,
    exact: false,
  },
  {
    href: "/dashboard/jobs",
    label: "Jobs",
    icon: <Briefcase className="w-4 h-4" />,
    exact: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-200 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 px-4 border-b border-sidebar-border shrink-0",
          collapsed && "justify-center px-0"
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      {/* AI Badge */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl ai-gradient border border-[--ai-border]">
            <Sparkles className="w-3.5 h-3.5 text-[--ai] shrink-0" />
            <span className="text-xs font-medium text-[--ai]">
              AI Powered
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">
            Workspace
          </p>
        )}

        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
            collapsed={collapsed}
          >
            {item.label}
          </NavItem>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 pt-2 border-t border-sidebar-border space-y-0.5 shrink-0">
        <NavItem
          href="/dashboard/settings"
          icon={<Settings className="w-4 h-4" />}
          active={pathname.startsWith("/dashboard/settings")}
          collapsed={collapsed}
        >
          Settings
        </NavItem>

        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/5",
            "transition-all duration-150",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20",
          "w-6 h-6 rounded-full",
          "bg-background border border-border",
          "flex items-center justify-center",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-150 hover:scale-110",
          "shadow-sm z-10"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}