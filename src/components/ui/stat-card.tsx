"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";

export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className="
      rounded-xl
      border
      border-border
      p-4
      bg-card
    "
    >
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="text-xl font-semibold">
        {value}
      </p>
    </motion.div>
  );
}