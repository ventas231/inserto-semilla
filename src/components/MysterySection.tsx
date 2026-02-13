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
          Dentro de tu papel hay algo creciendo.
        </h2>

        <p className="text-lg text-foreground/80 font-sans leading-relaxed mb-6">
          Cada papel semilla contiene una planta distinta.
          <br />
          El número impreso en el tuyo es la clave para descubrir cuál te tocó.
        </p>

        <p className="text-base text-muted-foreground font-sans mb-10 italic">
          Primero desbloquea tu acceso.
        </p>

        <Button variant="hero" size="xl" onClick={onCtaClick}>
          Quiero descubrir la mía
        </Button>
      </div>
    </section>
  );
};

export default MysterySection;
