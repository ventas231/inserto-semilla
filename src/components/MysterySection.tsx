import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface MysterySectionProps {
  onCtaClick: () => void;
}

const MysterySection = ({ onCtaClick }: MysterySectionProps) => {
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
    <section ref={sectionRef} className="py-24 sm:py-32 px-6 bg-secondary/40">
      <div className={`max-w-lg mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
          El misterio
        </p>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-8">
          Dos plantas, una sorpresa
        </h2>

        <p className="text-lg text-foreground/80 font-sans leading-relaxed mb-6">
          Tu papel semilla contiene una de estas dos plantas:
        </p>

        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/60 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🌼</span>
            </div>
            <p className="font-serif text-foreground">Manzanilla</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/60 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">☁️</span>
            </div>
            <p className="font-serif text-foreground">Flor de nube</p>
          </div>
        </div>

        <p className="text-base text-muted-foreground font-sans mb-10 italic">
          ¿Cuál será la tuya? Solo hay una forma de saberlo.
        </p>

        <Button variant="hero" size="xl" onClick={onCtaClick}>
          Quiero revelar mi planta
        </Button>
      </div>
    </section>
  );
};

export default MysterySection;
