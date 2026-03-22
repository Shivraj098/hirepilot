"use client";

import { motion } from "framer-motion";

export default function Progress({
  value,
}: {
  value: number;
}) {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4 }}
        className="h-full bg-primary/90"
      />

    </div>
  );
}