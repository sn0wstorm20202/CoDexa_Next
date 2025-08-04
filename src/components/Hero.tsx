'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClientOnlyFloatingElements } from "./ClientOnlyFloatingElements";
import Link from "next/link";

const Hero = () => {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-bg" />

      {/* 3D floating elements */}
              <ClientOnlyFloatingElements />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-hero gradient-text mb-6">
            Build Beautiful Apps
            <br />
            <span className="text-white">with CoDexa</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-subtitle text-white/80 mb-8 max-w-3xl mx-auto"
        >
          Transform your ideas into professional web applications with AI-powered development.
          No coding required, unlimited possibilities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center items-center"
        >
          <Link href="/builder">
            <Button
              variant="default"
              size="lg"
              className="hover-lift group relative overflow-hidden"
            >
              <span className="relative z-10">Start Building Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 text-sm text-white/60"
        >
          No credit card required • Build unlimited projects
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />
    </section>
  );
};

export default Hero;