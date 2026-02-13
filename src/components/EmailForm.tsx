import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().trim().email("Por favor ingresa un correo válido").max(255);

interface EmailFormProps {
  formRef?: React.RefObject<HTMLDivElement>;
}

const EmailForm = ({ formRef }: EmailFormProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const ref = formRef || sectionRef;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    const el = ref.current || sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      navigate("/seleccionar");
    }, 800);
  };

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6 bg-background">
      <div className={`max-w-md mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-12 h-px bg-primary mx-auto mb-10" />

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
          Desbloquea tu guía
        </h2>

        <p className="text-base text-muted-foreground font-sans mb-10">
          Ingresa tu correo y descubre qué planta vive en tu papel semilla.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="tu@correo.com"
              className="w-full h-14 px-6 rounded-lg border border-border bg-card text-foreground font-sans text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
              required
              maxLength={255}
            />
            {error && (
              <p className="mt-2 text-sm text-destructive font-sans">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Desbloqueando..." : "Desbloquear mi guía"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground font-sans">
          Solo usaremos tu correo para enviarte la guía. Sin spam.
        </p>
      </div>
    </section>
  );
};

export default EmailForm;
