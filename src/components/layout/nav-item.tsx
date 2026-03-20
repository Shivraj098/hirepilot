"use client";

import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

export default function NavItem({
  href,
  children,
  icon,
  active,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
        active
          ? "bg-muted border border-border/60 text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}