import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Leaf, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().trim().email("Por favor ingresa un correo válido").max(255),
  firstName: z.string().trim().max(100).optional(),
});

interface EmailFormProps {
  formRef?: React.RefObject<HTMLDivElement>;
}

const EmailForm = ({ formRef }: EmailFormProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error" | "">("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResultMessage("");
    setResultType("");

    const result = formSchema.safeParse({ email, firstName: firstName || undefined });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("shopify-customer", {
        body: {
          email: result.data.email,
          firstName: result.data.firstName,
          acceptsMarketing: true,
        },
      });

      if (fnError) {
        console.error("Edge function error:", fnError);
        setResultMessage("No se pudo guardar. Intenta de nuevo.");
        setResultType("error");
      } else if (data?.success) {
        setResultMessage(data.message);
        setResultType("success");
      } else {
        setResultMessage(data?.message || "No se pudo guardar. Intenta de nuevo.");
        setResultType("error");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setResultMessage("No se pudo guardar. Intenta de nuevo.");
      setResultType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resultType === "success") {
    return (
      <section ref={ref} className="py-16 sm:py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-md mx-auto">
          <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🌱</span>
            </div>
            <h2 className="text-2xl font-serif text-foreground mb-3">{resultMessage}</h2>
            <p className="text-sm text-muted-foreground font-sans">
              Revisa tu correo electrónico para más información sobre tu plantita.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="tu@correo.com"
              className="w-full h-13 px-5 rounded-xl border border-border bg-background text-foreground font-sans text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-300"
              required
              maxLength={255}
            />

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full h-13 px-5 rounded-xl border border-border bg-background text-foreground font-sans text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-300"
              maxLength={100}
            />


            {error && (
              <p className="text-sm text-destructive font-sans">{error}</p>
            )}

            {resultType === "error" && resultMessage && (
              <p className="text-sm text-destructive font-sans">{resultMessage}</p>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full group"
              disabled={isSubmitting}
            >
              <Leaf className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
              {isSubmitting ? "Guardando..." : "Desbloquear mi guía"}
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
