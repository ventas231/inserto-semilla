import { useState, useEffect, useRef, useCallback } from "react";
import { Leaf, Flower2 } from "lucide-react";
import florDeNubeImg from "@/assets/flor-de-nube.jpg";
import manzanillaImg from "@/assets/manzanilla.jpg";
import chiaImg from "@/assets/chia.jpg";

const plants = [
  { src: florDeNubeImg, name: "???" },
  { src: manzanillaImg, name: "???" },
  { src: chiaImg, name: "???" },
  { src: florDeNubeImg, name: "???" },
  { src: manzanillaImg, name: "???" },
  { src: chiaImg, name: "???" },
];

const PlantCarousel = () => {
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
    setActiveIndex((prev) => (prev + 1) % plants.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + plants.length) % plants.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    intervalRef.current = setInterval(next, 3500);
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
      intervalRef.current = setInterval(next, 3500);
    }
  };

  const getPosition = (index: number) => {
    const diff = (index - activeIndex + plants.length) % plants.length;
    // Map to -2, -1, 0, 1, 2, hidden
    if (diff === 0) return "center";
    if (diff === 1 || diff === plants.length - 1) return diff === 1 ? "right1" : "left1";
    if (diff === 2 || diff === plants.length - 2) return diff === 2 ? "right2" : "left2";
    return "hidden";
  };

  const positionStyles: Record<string, string> = {
    center: "z-30 scale-100 opacity-100 translate-x-0",
    left1: "z-20 scale-[0.78] opacity-70 -translate-x-[65%]",
    right1: "z-20 scale-[0.78] opacity-70 translate-x-[65%]",
    left2: "z-10 scale-[0.6] opacity-35 -translate-x-[115%]",
    right2: "z-10 scale-[0.6] opacity-35 translate-x-[115%]",
    hidden: "z-0 scale-50 opacity-0 translate-x-0",
  };

  return (
    <div
      ref={sectionRef}
      className={`relative w-full max-w-lg mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Depth shadow behind carousel */}
      <div className="absolute inset-x-8 bottom-0 h-8 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative h-56 sm:h-72 flex items-center justify-center">
        {plants.map((plant, index) => {
          const pos = getPosition(index);
          return (
            <div
              key={index}
              className={`absolute w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 shadow-lg cursor-pointer transition-all duration-600 ease-out ${positionStyles[pos]} ${pos === "center" ? "border-primary/30 shadow-xl" : "border-border/30"}`}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setActiveIndex(index);
                intervalRef.current = setInterval(next, 3500);
              }}
            >
              <img
                src={plant.src}
                alt={`Plantita misteriosa ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Mystery overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent flex items-end justify-center pb-3">
                <span className="text-background font-serif text-lg tracking-wider">?</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {plants.slice(0, 3).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setActiveIndex(i);
              intervalRef.current = setInterval(next, 3500);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex % 3 === i ? "bg-primary w-5" : "bg-primary/25"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PlantCarousel;
