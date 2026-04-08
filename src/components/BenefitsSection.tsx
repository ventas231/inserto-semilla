import { useEffect, useRef, useState } from "react";
import { Sprout, Droplets, Sun, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BenefitsSectionProps {
  onCtaClick?: () => void;
}

const benefits = [
  {
    icon: Sprout,
    title: "Guía de plantado",
    description: "Instrucciones claras para plantar correctamente tu papel semilla.",
  },
  {
    icon: Droplets,
    title: "Cuidados específicos",
    description: "Recomendaciones de riego personalizadas según tu planta.",
  },
  {
    icon: Sun,
    title: "Luz ideal",
    description: "Descubre cuánta luz necesita para crecer fuerte y sana.",
  },
  {
    icon: Clock,
    title: "Tiempo de germinación",
    description: "Sabrás exactamente cuándo esperar los primeros brotes.",
  },
  {
    icon: Play,
    title: "Video tutorial",
    description: "Un video paso a paso para guiarte en todo el proceso.",
  },
];

const BenefitsSection = ({ onCtaClick }: BenefitsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary mb-3 font-sans font-medium">
            Lo que recibirás
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground">
            Tu guía completa de plantado
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`group p-5 rounded-xl bg-card/80 border border-border/40 text-center transition-all duration-500 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 hover:bg-card ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-serif text-sm mb-1 text-foreground">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {onCtaClick && (
          <div className={`text-center mt-10 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Button variant="hero" size="xl" onClick={onCtaClick}>
              Quiero mi guía
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BenefitsSection;
