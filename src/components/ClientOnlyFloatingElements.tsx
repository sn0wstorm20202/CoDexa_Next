'use client'

import { motion } from "framer-motion";
import { FloatingElements } from "./FloatingElements";

export const ClientOnlyFloatingElements = () => {
  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 1 }}
    >
      <FloatingElements />
    </motion.div>
  );
}; 