"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  active?: boolean;
  badge?: number;
  collapsed?: boolean;
}

export default function NavItem({
  href,
  children,
  icon,
  active,
  badge,
  collapsed = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
        "transition-all duration-150",
        "group",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? String(children) : undefined}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-full" />
      )}

      <span
        className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          active
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
        )}
      >
        {icon}
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{children}</span>

          {badge !== undefined && badge > 0 && (
            <span className="ml-auto text-xs bg-sidebar-primary text-sidebar-primary-foreground px-1.5 py-0.5 rounded-md font-medium">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}