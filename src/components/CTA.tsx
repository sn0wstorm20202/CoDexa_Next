'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass p-12 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build your
              <span className="gradient-text"> next project?</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already building amazing applications with Lovable Clone.
              Start your free trial today - no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="default" size="lg" className="hover-lift">
                Start Building Now
              </Button>
              <Button variant="outline" size="lg" className="hover-lift">
                Schedule Demo
              </Button>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              🎉 Limited time: Get 50% off your first year with code EARLY50
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;