"use client";

import { motion } from "framer-motion";
import { stagger } from "@/lib/motion";

export default function Section({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
}