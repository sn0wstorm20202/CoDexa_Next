'use client'

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "TechVision",
    content: "Lovable Clone transformed our development process. We launched our MVP in just 2 weeks instead of 3 months!",
    avatar: "👩‍💼",
    rating: 5,
    metrics: "3x faster development"
  },
  {
    name: "Marcus Chen",
    role: "Product Manager",
    company: "DigitalFlow",
    content: "The AI understands exactly what we want to build. It's like having a senior developer who never sleeps.",
    avatar: "👨‍💻",
    rating: 5,
    metrics: "90% time saved"
  },
  {
    name: "Emily Rodriguez",
    role: "Designer",
    company: "Creative Studio",
    content: "Beautiful designs that actually work. No more handoff issues between design and development teams.",
    avatar: "👩‍🎨",
    rating: 5,
    metrics: "Zero handoff issues"
  },
  {
    name: "David Park",
    role: "Entrepreneur",
    company: "InnovateLab",
    content: "I can finally bring my ideas to life without learning to code. The platform is intuitive and powerful.",
    avatar: "👨‍🚀",
    rating: 5,
    metrics: "5 apps launched"
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by <span className="gradient-text">thousands</span> of creators
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what our community is building and how Lovable Clone is transforming their workflows
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <Card className="glass p-8 max-w-2xl mx-auto text-center">
                  <div className="text-6xl mb-6">{testimonial.avatar}</div>

                  <blockquote className="text-lg md:text-xl font-medium mb-6 leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  <StarRating rating={testimonial.rating} />

                  <div className="mt-6">
                    <div className="font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                    <div className="mt-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full inline-block">
                      {testimonial.metrics}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary' : 'bg-white/20'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;