"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "ai";
  className?: string;
  animate?: boolean;
}

const trackSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const fillVariants = {
  default: "bg-primary",
  success: "score-gradient-high",
  warning: "score-gradient-mid",
  danger: "score-gradient-low",
  ai: "bg-[--ai]",
};

function getAutoVariant(
  value: number
): "success" | "warning" | "danger" {
  if (value >= 70) return "success";
  if (value >= 40) return "warning";
  return "danger";
}

export default function Progress({
  value,
  size = "md",
  showLabel = false,
  variant,
  className,
  animate = true,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolvedVariant = variant ?? getAutoVariant(clamped);

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score</span>
          <span className="font-medium text-foreground">
            {clamped}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full overflow-hidden bg-muted",
          trackSizes[size]
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "h-full rounded-full",
            fillVariants[resolvedVariant]
          )}
        />
      </div>
    </div>
  );
}