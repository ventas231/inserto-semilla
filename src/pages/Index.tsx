import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import StorytellingSection from "@/components/StorytellingSection";
import BenefitsSection from "@/components/BenefitsSection";
import MysterySection from "@/components/MysterySection";
import EmailForm from "@/components/EmailForm";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection onCtaClick={scrollToForm} />
      <StorytellingSection onCtaClick={scrollToForm} />
      <BenefitsSection onCtaClick={scrollToForm} />
      <MysterySection onCtaClick={scrollToForm} />
      <EmailForm formRef={formRef} />

      {/* Footer */}
      <footer className="py-12 px-6 bg-secondary/30 text-center">
        <p className="text-xs text-muted-foreground font-sans tracking-wide">
          Papel Semilla · Una experiencia que florece
        </p>
      </footer>
    </main>
  );
};

export default Index;
