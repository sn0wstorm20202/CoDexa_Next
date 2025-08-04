import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <Hero />
            <div id="features">
                <Features />
            </div>
            <div id="testimonials">
                <Testimonials />
            </div>
            <div id="pricing">
                <Pricing />
            </div>
            <CTA />
            <Footer />
        </div>
    );
} 