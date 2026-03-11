import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Leaf, Mail } from "lucide-react";

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
    sessionStorage.setItem("user_email", result.data);

    setTimeout(() => {
      navigate("/seleccionar");
    }, 800);
  };

  return (
    <section ref={ref} className="py-16 sm:py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className={`max-w-md mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-500">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-foreground mb-3">
              Desbloquea tu guía
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Ingresa tu correo y descubre qué planta vive en tu papel semilla.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@correo.com"
                className="w-full h-13 px-5 rounded-xl border border-border bg-background text-foreground font-sans text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-300"
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
              className="w-full group"
              disabled={isSubmitting}
            >
              <Leaf className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
              {isSubmitting ? "Desbloqueando..." : "Desbloquear mi guía"}
            </Button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground font-sans text-center">
            Solo usaremos tu correo para enviarte la guía. Sin spam. 🌿
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmailForm;
