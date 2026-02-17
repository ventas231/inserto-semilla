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

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-6 bg-secondary/40 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/30 rounded-full blur-3xl" />

      <div className={`max-w-2xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
          El misterio
        </p>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-12">
          Una de estas está creciendo para ti…
        </h2>

        {/* Single mystery card */}
        <div
          className={`mx-auto max-w-[200px] group rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm p-10 flex flex-col items-center gap-4 transition-all duration-700 hover:shadow-lg hover:border-primary/30 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <Sprout className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors duration-300" />
          <span className="text-5xl font-serif text-primary/50 group-hover:text-primary transition-colors duration-500" style={{ animation: 'gentlePulse 3s ease-in-out infinite' }}>
            ?
          </span>
        </div>

        <p className="text-base sm:text-lg text-foreground/80 font-sans leading-relaxed mt-12 mb-10">
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
