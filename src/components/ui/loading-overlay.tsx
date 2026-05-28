"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LoadingOverlayProps {
  text?: string;
  step?: number;
  totalSteps?: number;
}

export default function LoadingOverlay({
  text,
  step = 0,
  totalSteps = 1,
}: LoadingOverlayProps) {
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 rounded-2xl bg-background/90 backdrop-blur-sm flex items-center justify-center z-50"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 px-8 text-center">
        {/* Pulsing AI icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="p-4 rounded-2xl ai-gradient border border-[--ai-border]"
        >
          <Sparkles className="w-6 h-6 text-[--ai]" />
        </motion.div>

        {text && (
          <p className="text-sm font-medium text-foreground">{text}</p>
        )}

        {/* Progress bar */}
        {totalSteps > 1 && (
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full bg-[--ai] rounded-full"
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {step + 1} of {totalSteps} steps
        </p>
      </div>
    </motion.div>
  );
}