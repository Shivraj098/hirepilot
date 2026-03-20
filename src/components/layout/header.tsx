"use client";

export default function Header() {
  return (
    <header
      className="
      h-14
      border-b
      border-border/60
      bg-background
      flex
      items-center
      justify-between
      px-6
    "
    >
      <h1 className="text-sm font-semibold tracking-tight">
        HirePilot Workspace
      </h1>

      <div className="text-sm text-muted-foreground">
        AI Resume Intelligence
      </div>
    </header>
  );
}