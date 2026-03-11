import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const codeMap: Record<string, string> = {
  "00756": "manzanilla",
  "00111": "flor-de-nube",
  "00998": "chia",
};

const codeSchema = z.string().trim().min(1, "Ingresa el código de tu papel semilla");

const SelectPlant = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Get email from sessionStorage
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

      toast("¡Éxito!", {
        description: "Tu información se guardó correctamente.",
      });

      // Clean up
      sessionStorage.removeItem("user_email");

      setTimeout(() => {
        navigate(`/revelacion/${plant}`);
      }, 1200);
    } catch (err: unknown) {
      console.error("Shopify error:", err);
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full text-center py-20 relative z-10">
        <p className="animate-fade-up text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
          Último paso
        </p>

        <h1 className="animate-fade-up-delay-1 text-3xl sm:text-4xl font-serif text-foreground mb-4 leading-tight">
          Busca el código en tu papel semilla
        </h1>

        <p className="animate-fade-up-delay-2 text-base text-muted-foreground font-sans mb-12">
          Ingresa el código impreso en tu papel para revelar tu planta.
        </p>

        <form onSubmit={handleSubmit} className="animate-fade-up-delay-3 space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              placeholder="Ej: 00756"
              className="w-full h-16 px-6 rounded-xl border border-border bg-card text-foreground font-serif text-2xl text-center tracking-[0.3em] placeholder:text-muted-foreground/40 placeholder:tracking-[0.2em] placeholder:text-lg placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
              maxLength={10}
            />
            {error && (
              <p className="mt-3 text-sm text-destructive font-sans">{error}</p>
            )}
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
    </main>
  );
};

export default SelectPlant;
