import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

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

  const plants = [
    { label: "Planta 01" },
    { label: "Planta 02" },
    { label: "Planta 03" },
  ];

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-6 bg-secondary/40">
      <div className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
          El misterio
        </p>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-12">
          Una de estas está creciendo para ti…
        </h2>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12">
          {plants.map((plant, i) => (
            <div
              key={i}
              className={`group rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center gap-3 transition-all duration-700 hover:shadow-md hover:border-primary/30 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-primary/70 group-hover:text-primary transition-colors duration-300" />
              <p className="text-xs sm:text-sm font-sans text-muted-foreground tracking-wide">
                {plant.label}
              </p>
              <span className="text-3xl sm:text-4xl font-serif text-primary/50 group-hover:text-primary transition-colors duration-300">
                ?
              </span>
            </div>
          ))}
        </div>

        <p className="text-base sm:text-lg text-foreground/80 font-sans leading-relaxed mb-10">
          Cada papel semilla guarda una sorpresa distinta.
          <br />
          Descubre cuál te tocó.
        </p>

        <Button variant="hero" size="xl" onClick={onCtaClick}>
          Descubrir mi planta
        </Button>
      </div>
    </section>
  );
};

export default MysterySection;
