import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const gaps = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

export default function Section({
  children,
  className,
  gap = "md",
}: SectionProps) {
  return (
    <div className={cn(gaps[gap], className)}>
      {children}
    </div>
  );
}