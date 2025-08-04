'use client'

import { motion } from "framer-motion";

const FloatingElement = ({ 
  delay = 0, 
  color = "#3b82f6", 
  size = "w-4 h-4",
  position = "top-20 left-20"
}: {
  delay?: number;
  color?: string;
  size?: string;
  position?: string;
}) => {
  return (
    <motion.div
      className={`absolute ${size} ${position} rounded-full opacity-20`}
      style={{ backgroundColor: color }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
};

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <FloatingElement 
        delay={0} 
        color="#3b82f6" 
        size="w-6 h-6" 
        position="top-20 left-20" 
      />
      <FloatingElement 
        delay={0.5} 
        color="#10b981" 
        size="w-4 h-4" 
        position="top-40 right-32" 
      />
      <FloatingElement 
        delay={1} 
        color="#8b5cf6" 
        size="w-5 h-5" 
        position="top-60 left-1/3" 
      />
      <FloatingElement 
        delay={1.5} 
        color="#f59e0b" 
        size="w-3 h-3" 
        position="top-80 right-16" 
      />
      <FloatingElement 
        delay={2} 
        color="#ef4444" 
        size="w-4 h-4" 
        position="top-32 left-1/2" 
      />
      <FloatingElement 
        delay={2.5} 
        color="#06b6d4" 
        size="w-5 h-5" 
        position="top-72 right-1/4" 
      />
    </div>
  );
};