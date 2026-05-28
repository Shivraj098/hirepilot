"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = () => {
      setMounted(true);
    };
    init();
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      {/* Left — breadcrumb placeholder */}
      <div />

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-all duration-150",
          )}
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-all duration-150",
          )}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-xs font-semibold text-primary-foreground">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
