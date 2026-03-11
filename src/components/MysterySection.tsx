import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sprout, Leaf, Flower2 } from "lucide-react";
import PlantCarousel from "@/components/PlantCarousel";

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
    <section ref={sectionRef} className="py-16 sm:py-20 px-6 bg-gradient-to-b from-secondary/40 to-primary/[0.06] relative overflow-hidden">
      {/* Floating nature accents */}
      <div className="absolute top-8 left-8 text-primary/10">
        <Leaf className="w-20 h-20 -rotate-12" />
      </div>
      <div className="absolute bottom-8 right-12 text-primary/10">
        <Flower2 className="w-16 h-16 rotate-12" />
      </div>

      <div className={`max-w-lg mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm tracking-[0.25em] uppercase text-primary mb-4 font-sans font-medium">
          El misterio
        </p>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
          Cada papel semilla guarda una pequeña sorpresa de la naturaleza
        </h2>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-10 max-w-md mx-auto">
          <strong className="text-foreground">Ingresa tu código para descubrir qué plantita comenzó su camino contigo.</strong>
        </p>

        {/* 3D Carousel */}
        <div className="mb-10">
          <PlantCarousel onCardClick={onCtaClick} />
        </div>

        <Button variant="hero" size="xl" onClick={onCtaClick} className="group">
          <Sprout className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
          Descubrir mi planta
        </Button>
      </div>
    </section>
  );
};

export default MysterySection;
