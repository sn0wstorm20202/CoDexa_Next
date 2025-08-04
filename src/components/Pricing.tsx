'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small projects",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "3 projects",
      "Basic templates",
      "Community support",
      "Standard hosting",
      "Basic AI assistance"
    ],
    cta: "Start Free",
    popular: false,
    gradient: "from-gray-500 to-gray-600"
  },
  {
    name: "Pro",
    description: "Best for growing teams and businesses",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "Unlimited projects",
      "Premium templates",
      "Priority support",
      "Custom domains",
      "Advanced AI features",
      "Team collaboration",
      "Export source code"
    ],
    cta: "Start Pro Trial",
    popular: true,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      "Everything in Pro",
      "White-label solution",
      "Custom integrations",
      "Dedicated support",
      "Advanced security",
      "SLA guarantee",
      "Custom training"
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-purple-500 to-pink-600"
  }
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { selectedPlan, setSelectedPlan } = useUIStore();

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
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-primary' : 'bg-muted'
                }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-medium">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <Card
                className={`glass p-8 h-full relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'hover:border-primary/30'
                  } ${selectedPlan === plan.name ? 'border-primary shadow-xl shadow-primary/30' : ''}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`} />

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="line-through">${plan.monthlyPrice}</span> monthly
                        </div>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <span className="text-green-500 text-sm">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/builder">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      className="w-full hover-lift"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;