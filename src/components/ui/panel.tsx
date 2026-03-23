"use client";
import { motion } from "framer-motion";
import { scaleIn, hoverLift } from "@/lib/motion";
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
      {...hoverLift}
      className={clsx(
  `
  rounded-2xl
  border
  border-border/70
  hover:border-foreground/20
  bg-card
  p-6
  shadow-sm
  transition
  hover:shadow-md
  
  `,
  className
)}
    >
      {children}
    </motion.div>
  );
}