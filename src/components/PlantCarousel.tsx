import { useState, useEffect, useRef, useCallback } from "react";
import { Sprout, HelpCircle } from "lucide-react";

const CARD_COUNT = 7;

interface PlantCarouselProps {
  onCardClick?: () => void;
}

const PlantCarousel = ({ onCardClick }: PlantCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % CARD_COUNT);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + CARD_COUNT) % CARD_COUNT);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(next, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      diff > 0 ? next() : prev();
      intervalRef.current = setInterval(next, 3000);
    }
  };

  const getPosition = (index: number) => {
    const diff = (index - activeIndex + CARD_COUNT) % CARD_COUNT;
    if (diff === 0) return "center";
    if (diff === 1) return "right1";
    if (diff === CARD_COUNT - 1) return "left1";
    if (diff === 2) return "right2";
    if (diff === CARD_COUNT - 2) return "left2";
    return "hidden";
  };

  const positionStyles: Record<string, string> = {
    center: "z-30 scale-100 opacity-100 translate-x-0",
    left1: "z-20 scale-[0.78] opacity-70 -translate-x-[70%]",
    right1: "z-20 scale-[0.78] opacity-70 translate-x-[70%]",
    left2: "z-10 scale-[0.58] opacity-30 -translate-x-[120%]",
    right2: "z-10 scale-[0.58] opacity-30 translate-x-[120%]",
    hidden: "z-0 scale-50 opacity-0 translate-x-0 pointer-events-none",
  };

  // Subtle color variations for mystery cards
  const cardAccents = [
    "from-primary/20 to-primary/5",
    "from-accent/30 to-accent/10",
    "from-secondary/50 to-secondary/20",
    "from-primary/15 to-accent/10",
    "from-accent/20 to-primary/8",
    "from-secondary/40 to-primary/10",
    "from-primary/25 to-secondary/15",
  ];

  const handleCardClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIndex(index);
    intervalRef.current = setInterval(next, 3000);
    onCardClick?.();
  };

  return (
    <div
      ref={sectionRef}
      className={`relative w-full max-w-lg mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-x-8 bottom-0 h-8 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative h-56 sm:h-72 flex items-center justify-center">
        {Array.from({ length: CARD_COUNT }).map((_, index) => {
          const pos = getPosition(index);
          const isCenter = pos === "center";
          return (
            <div
              key={index}
              className={`absolute w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out ${positionStyles[pos]} ${isCenter ? "shadow-2xl" : "shadow-lg"}`}
              onClick={() => handleCardClick(index)}
              role="button"
              aria-label="Descubre tu plantita"
            >
              {/* Card background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cardAccents[index % cardAccents.length]}`} />
              <div className="absolute inset-0 border-2 rounded-2xl border-primary/15" />

              {/* Mystery content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
                <div className={`relative transition-transform duration-700 ${isCenter ? "scale-110" : "scale-100"}`}>
                  <Sprout className={`text-primary ${isCenter ? "w-12 h-12" : "w-9 h-9"} transition-all duration-500`} strokeWidth={1.5} />
                  <HelpCircle className={`absolute -top-1 -right-2 text-primary/60 ${isCenter ? "w-5 h-5" : "w-4 h-4"} transition-all duration-500`} strokeWidth={2} />
                </div>
                <span className={`font-serif tracking-widest text-foreground/70 ${isCenter ? "text-2xl" : "text-lg"} transition-all duration-500`}>
                  ?
                </span>
                {isCenter && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-sans mt-1 animate-pulse">
                    Toca para descubrir
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-primary w-5" : "bg-primary/20 w-1.5"}`}
            aria-label={`Tarjeta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PlantCarousel;
