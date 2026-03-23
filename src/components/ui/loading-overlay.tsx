"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingOverlay({
  text,
}: {
  text?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        absolute
        inset-0
        rounded-2xl
        bg-background/80
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div className="flex flex-col items-center gap-3">

        <Loader2 className="w-6 h-6 animate-spin" />

        {text && (
          <p className="text-sm text-muted-foreground">
            {text}
          </p>
        )}

      </div>
    </motion.div>
  );
}