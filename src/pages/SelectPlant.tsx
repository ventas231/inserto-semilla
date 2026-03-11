import { useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import plantingToolsImg from "@/assets/planting-tools.jpg";
import growingPlantsImg from "@/assets/growing-plants.jpg";
import caringPlantImg from "@/assets/caring-plant.jpg";

const codeMap: Record<string, string> = {
  "000756": "flor-de-nube",
  "000111": "manzanilla",
  "000571": "chia",
  "000000": "flor-de-nube",
};

const codeSchema = z.string().trim().min(1, "Ingresa el código de tu papel semilla");

const SelectPlant = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = codeSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    const plant = codeMap[result.data];
    if (!plant) {
      setError("Código no válido. Revisa el número impreso en tu papel semilla.");
      return;
    }

    setIsSubmitting(true);

    const email = sessionStorage.getItem("user_email");
    if (!email) {
      setError("No se encontró tu correo. Regresa e ingresa tu email.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("shopify-customer", {
        body: { email, code: result.data },
      });

      if (fnError) {
        throw new Error(fnError.message || "Error al conectar con Shopify");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Error al guardar en Shopify");
      }

      sessionStorage.removeItem("user_email");
      setSuccess(true);
      setIsSubmitting(false);
    } catch (err: unknown) {
      console.error("Shopify error:", err);
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-10 left-5 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-5 w-56 h-56 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <div className="max-w-lg w-full text-center animate-fade-up">
            {/* Success icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-5xl">🌱</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4 leading-tight">
              ¡Perfecto! Tu código fue registrado correctamente.
            </h1>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 mt-8 space-y-5">
              <p className="text-lg text-foreground font-serif leading-relaxed">
                Tu plantita ya está en camino 🌱
              </p>
              <p className="text-base text-muted-foreground font-sans leading-relaxed">
                Revisa tu correo electrónico, ahí encontrarás la información completa sobre la semilla que recibiste y cómo empezar a cultivarla.
              </p>
              <div className="border-t border-border/50 pt-5">
                <p className="text-sm text-muted-foreground/80 font-sans leading-relaxed">
                  📬 Si no ves el correo en tu bandeja principal, revisa también tu carpeta de promociones o spam.
                </p>
              </div>
            </div>

            {/* Growing plant image */}
            <div className="mt-10 rounded-2xl overflow-hidden shadow-lg max-w-sm mx-auto">
              <img
                src={growingPlantsImg}
                alt="Plantitas creciendo en macetas biodegradables"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-10 left-5 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-5 w-56 h-56 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="animate-fade-up text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
            Último paso
          </p>
          <h1 className="animate-fade-up-delay-1 text-3xl sm:text-4xl font-serif text-foreground mb-3 leading-tight">
            Busca el código de tu papel semilla
          </h1>
          <p className="animate-fade-up-delay-2 text-base text-muted-foreground font-sans max-w-md mx-auto">
            Ingresa el código impreso en tu papel para revelar tu plantita.
          </p>
        </div>

        {/* Image flow: Preparation */}
        <div className="animate-fade-up-delay-2 mb-8">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={plantingToolsImg}
              alt="Herramientas y materiales para plantar una semilla"
              className="w-full h-44 sm:h-56 object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-muted-foreground/70 font-sans text-center mt-3 tracking-wide uppercase">
            Prepara tus materiales para plantar
          </p>
        </div>

        {/* Code input form */}
        <div className="animate-fade-up-delay-3">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(""); }}
                  placeholder="Ej: 000756"
                  className="w-full h-16 px-6 rounded-xl border border-border bg-background text-foreground font-serif text-2xl text-center tracking-[0.3em] placeholder:text-muted-foreground/40 placeholder:tracking-[0.2em] placeholder:text-lg placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
                  maxLength={10}
                />
                {error && (
                  <p className="mt-3 text-sm text-destructive font-sans">{error}</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground/70 font-sans text-center">
                  Nota: Si tu papel semilla no tiene número, ingresa <span className="font-medium text-muted-foreground">000000</span>.
                </p>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Revelar mi planta"}
              </Button>
            </form>
          </div>
        </div>

        {/* Image flow: Growth & Care */}
        <div className="grid grid-cols-2 gap-4 mt-10 animate-fade-up-delay-3">
          <div>
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src={growingPlantsImg}
                alt="Plantitas creciendo en macetas"
                className="w-full h-36 sm:h-44 object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-muted-foreground/70 font-sans text-center mt-2 tracking-wide uppercase">
              Observa cómo crece
            </p>
          </div>
          <div>
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src={caringPlantImg}
                alt="Dos personas cuidando una plantita"
                className="w-full h-36 sm:h-44 object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-muted-foreground/70 font-sans text-center mt-2 tracking-wide uppercase">
              Cuida tu plantita
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/50 font-sans mt-12">
          Papel Semilla · Una experiencia que florece
        </p>
      </div>
    </main>
  );
};

export default SelectPlant;
