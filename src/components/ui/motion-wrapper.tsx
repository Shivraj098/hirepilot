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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}