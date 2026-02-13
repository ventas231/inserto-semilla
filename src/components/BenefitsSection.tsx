import { useEffect, useRef, useState } from "react";
import { Sprout, Droplets, Sun, Clock, Play } from "lucide-react";

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

const BenefitsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
            Lo que recibirás
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground">
            Tu guía completa de plantado
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`p-8 rounded-xl bg-card border border-border/50 text-center transition-all duration-700 hover:shadow-md hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
                <benefit.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-serif text-lg mb-2 text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
