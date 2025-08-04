'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { setScrolled } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      setScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrolled]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass border-b border-white/10 py-3'
          : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold gradient-text">
            CoDexa
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#about" className="text-sm hover:text-primary transition-colors">
              About
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Link href="/builder">
            <Button
              variant="outline"
              size="sm"
              className="glass border-primary/20 hover:border-primary/40 hidden md:inline-flex"
            >
              <MessageCircle size={16} className="mr-2" />
              Chat Now
            </Button>
          </Link>
          <Link href="/builder">
                          <Button variant="default" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;