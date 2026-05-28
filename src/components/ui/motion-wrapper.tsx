"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function MotionWrapper({
  children,
  delay = 0,
  className,
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      style={{ width: "100%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}