import heroImage from "@/assets/hero-seedpaper.jpg";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Papel semilla con brotes verdes emergiendo"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center py-20">
        <p className="animate-fade-up text-sm tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">
          Experiencia Papel Semilla
        </p>

        <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl md:text-6xl font-serif leading-tight mb-6 text-foreground">
          No es solo papel.
          <br />
          <em className="italic">Es vida esperando despertar.</em>
        </h1>

        <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto mb-10 font-sans leading-relaxed">
          Descubre qué plantita llegó a tus manos y recibe una guía exclusiva para verla florecer.
        </p>

        <div className="animate-fade-up-delay-3">
          <Button variant="hero" size="xl" onClick={onCtaClick}>
            Descubrir mi planta
          </Button>
          <p className="mt-4 text-sm text-muted-foreground font-sans">
            Recibe tu guía gratuita directamente en tu correo.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up-delay-3">
        <div className="w-px h-12 bg-foreground/20 mx-auto mb-2" />
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans">Explora</p>
      </div>
    </section>
  );
};

export default HeroSection;
