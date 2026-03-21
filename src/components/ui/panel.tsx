"use client";

import { motion } from "framer-motion";
import { scaleIn, panelHover } from "@/lib/motion";
import clsx from "clsx";

export default function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      {...panelHover}
      className={clsx("rounded-2xl border border-border bg-card p-5 shadow-sm transition",className
      )}
    >
      {children}
    </motion.div>
  );
}