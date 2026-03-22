import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    scale: 1,
  },
};

export const panelHover = {
  whileHover: {
    scale: 1.01,
    y: -2,
  },
};

export const tap = {
  whileTap: {
    scale: 0.97,
  },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const item: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

export const pageEnter: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
    },
  },
};
export const hoverLift = {
  whileHover: {
    y: -2,
    scale: 1.01,
  },
};