import heroImage from "@/assets/hero-seedpaper.jpg";
import plantingTools from "@/assets/planting-tools.jpg";
import { Button } from "@/components/ui/button";
import { Sprout, Leaf } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Papel semilla con brotes verdes emergiendo"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/20" />
      </div>

      {/* Floating nature elements */}
      <div className="absolute top-16 right-16 text-primary/20 animate-fade-up-delay-3">
        <Leaf className="w-16 h-16 rotate-45" />
      </div>
      <div className="absolute bottom-24 left-12 text-primary/15 animate-fade-up-delay-2">
        <Sprout className="w-12 h-12" />
      </div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-primary/20 animate-fade-up-delay-1" />
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-accent-foreground/15 animate-fade-up-delay-2" />

      {/* Content - asymmetric layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text side */}
          <div className="text-left">
            <div className="animate-fade-up inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Sprout className="w-4 h-4 text-primary" />
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-sans font-medium">
                Experiencia Papel Semilla
              </span>
            </div>

            <h1 className="animate-fade-up-delay-1 text-4xl sm:text-5xl md:text-6xl font-serif leading-[1.1] mb-6 text-foreground">
              No es solo papel.
              <br />
              <em className="italic text-primary">Es vida esperando despertar.</em>
            </h1>

            <p className="animate-fade-up-delay-2 text-xl sm:text-2xl text-foreground font-medium max-w-md mb-8 font-sans leading-relaxed">
              Descubre qué plantita llegó a tus manos y recibe una guía exclusiva para verla florecer.
            </p>

            <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-start gap-4">
              <Button variant="hero" size="xl" onClick={onCtaClick} className="group">
                <Sprout className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
                Descubrir mi planta
              </Button>
              <p className="text-sm text-muted-foreground font-sans self-center">
                Recibe tu guía gratuita 🌿
              </p>
            </div>
          </div>

          {/* Image side */}
          <div className="animate-fade-up-delay-2 hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/30 rounded-3xl blur-xl" />
              <img
                src={plantingTools}
                alt="Herramientas para plantar tu semilla"
                className="relative rounded-2xl shadow-2xl border border-border/30 w-full aspect-[4/3] object-cover"
              />
              <div className="absolute -bottom-3 -right-3 bg-card border border-border/50 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-sans text-foreground font-medium">100% plantable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-up-delay-3">
        <div className="w-px h-10 bg-foreground/20 mx-auto mb-1" />
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans">Explora</p>
      </div>
    </section>
  );
};

export default HeroSection;
