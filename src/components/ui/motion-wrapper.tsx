"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function MotionWrapper({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1], // smoother custom cubic-bezier
        delay,
      }}
      layout
    >
      {children}
    </motion.div>
  );
}