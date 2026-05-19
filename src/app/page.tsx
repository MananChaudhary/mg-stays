import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { AISection } from "@/components/marketing/ai-section";
import { ExperienceSection } from "@/components/marketing/experience";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { ContactSection } from "@/components/marketing/contact";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <AISection />
      <ExperienceSection />
      <Pricing />
      <Testimonials />
      <ContactSection />
      <Footer />
    </main>
  );
}
