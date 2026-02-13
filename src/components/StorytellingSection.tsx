import { useEffect, useRef, useState } from "react";

const StorytellingSection = () => {
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
      <div className={`max-w-xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-12 h-px bg-primary mx-auto mb-10" />

        <p className="text-lg sm:text-xl leading-relaxed text-foreground/80 font-sans mb-8">
          Cada fibra de este papel guarda una promesa silenciosa. Dentro de él, 
          semillas reales esperan el momento perfecto para comenzar su viaje.
        </p>

        <p className="text-lg sm:text-xl leading-relaxed text-foreground/80 font-sans mb-8">
          Lo que tienes en tus manos no es solo un papel —es el comienzo de algo vivo, 
          algo que crece, algo que florece.
        </p>

        <h2 className="text-2xl sm:text-3xl font-serif italic text-foreground mb-6">
          ¿Qué planta se esconde dentro?
        </h2>

        <p className="text-base text-muted-foreground font-sans">
          Solo hay una forma de descubrirlo.
        </p>

        <div className="w-12 h-px bg-primary mx-auto mt-10" />
      </div>
    </section>
  );
};

export default StorytellingSection;
