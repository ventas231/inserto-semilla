import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import StorytellingSection from "@/components/StorytellingSection";
import BenefitsSection from "@/components/BenefitsSection";
import MysterySection from "@/components/MysterySection";
import EmailForm from "@/components/EmailForm";
import { Leaf } from "lucide-react";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection onCtaClick={scrollToForm} />

      {/* Soft divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <StorytellingSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <BenefitsSection onCtaClick={scrollToForm} />

      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <MysterySection onCtaClick={scrollToForm} />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <EmailForm formRef={formRef} />

      {/* Brand section */}
      <section className="py-12 px-6 bg-secondary/30">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-sans text-foreground font-medium mb-2">
            Special Fit Socks
          </p>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed max-w-sm mx-auto">
            Esta experiencia fue creada por Special Fit Socks, una marca especializada en calcetines diseñados para cuidar tus pies con comodidad y bienestar.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-secondary/50 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground font-sans tracking-wide">
          Papel Semilla · Una experiencia que florece 🌱
        </p>
      </footer>
    </main>
  );
};

export default Index;
