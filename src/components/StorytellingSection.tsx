import { useEffect, useRef, useState } from "react";
import plantingTools from "@/assets/planting-tools.jpg";
import growingPlants from "@/assets/growing-plants.jpg";
import caringPlant from "@/assets/caring-plant.jpg";
import { Sprout, Search, Heart } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    number: "01",
    title: "Prepara tu papel semilla",
    description: "Tu papel contiene semillas reales listas para germinar.",
    image: plantingTools,
    alt: "Herramientas y materiales para plantar",
  },
  {
    icon: Search,
    number: "02",
    title: "Descubre qué plantita te tocó",
    description: "Cada papel semilla guarda una sorpresa distinta. Ingresa tu código y descubre cuál es la tuya.",
    image: growingPlants,
    alt: "Plantitas creciendo en macetas",
  },
  {
    icon: Heart,
    number: "03",
    title: "Cuida tu nueva planta",
    description: "Recibe una guía personalizada con todo lo que necesitas para verla florecer.",
    image: caringPlant,
    alt: "Personas cuidando una plantita",
  },
];

interface StorytellingSectionProps {
  onStepClick?: () => void;
}

const StorytellingSection = ({ onStepClick }: StorytellingSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-6 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary font-sans font-medium mb-3">
            ¿Cómo funciona?
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground">
            Tu experiencia en 3 pasos
          </h2>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              onClick={onStepClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onStepClick?.(); }}
              className={`group grid grid-cols-1 md:grid-cols-2 gap-6 items-center rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-5 sm:p-8 transition-all duration-700 hover:shadow-lg hover:border-primary/20 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className={`overflow-hidden rounded-xl ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <img
                  src={step.image}
                  alt={step.alt}
                  className="w-full aspect-[3/2] object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                />
              </div>

              {/* Text */}
              <div className={`flex flex-col gap-4 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary font-sans font-semibold">
                    Paso {step.number}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-foreground">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorytellingSection;
