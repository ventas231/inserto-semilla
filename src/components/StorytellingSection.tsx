import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface StorytellingSectionProps {
  onCtaClick: () => void;
}

const StorytellingSection = ({ onCtaClick }: StorytellingSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-6 bg-secondary/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

      <div className={`max-w-xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-12 h-px bg-primary mx-auto mb-10" />

        <h2 className="text-2xl sm:text-3xl font-serif italic text-foreground mb-8">
          ¿Qué planta se esconde dentro?
        </h2>

        <p className="text-base text-muted-foreground font-sans mb-10">
          Solo hay una forma de descubrirlo.
        </p>

        <Button variant="hero" size="xl" onClick={onCtaClick}>
          Descubrir mi planta
        </Button>

        <div className="w-12 h-px bg-primary mx-auto mt-10" />
      </div>
    </section>
  );
};

export default StorytellingSection;
