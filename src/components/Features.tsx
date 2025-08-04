'use client'

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "AI-Powered Development",
    description: "Transform natural language into beautiful, functional code instantly with our advanced AI engine.",
    icon: "🤖",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Real-time Preview",
    description: "See your changes instantly with live preview. What you see is exactly what you get.",
    icon: "⚡",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    title: "Professional Templates",
    description: "Start with stunning, production-ready templates designed by world-class designers.",
    icon: "🎨",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    title: "One-Click Deploy",
    description: "Deploy your application to production with a single click. No complex configurations needed.",
    icon: "🚀",
    gradient: "from-rose-500 to-orange-600"
  },
  {
    title: "Responsive Design",
    description: "Every application is automatically responsive and optimized for all devices and screen sizes.",
    icon: "📱",
    gradient: "from-orange-500 to-yellow-600"
  },
  {
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time collaboration tools and shared workspaces.",
    icon: "👥",
    gradient: "from-green-500 to-blue-500"
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to
            <span className="gradient-text"> build amazing apps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features that help you create professional applications without the complexity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass p-8 h-full hover-lift group cursor-pointer relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;