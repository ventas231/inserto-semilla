import { useParams, Link } from "react-router-dom";
import manzanillaImg from "@/assets/manzanilla.jpg";
import florDeNubeImg from "@/assets/flor-de-nube.jpg";
import { Button } from "@/components/ui/button";
import { Sprout, Droplets, Sun, Clock } from "lucide-react";

const plantData = {
  manzanilla: {
    name: "Manzanilla",
    image: manzanillaImg,
    emoji: "🌼",
    description:
      "La manzanilla es una planta aromática milenaria, conocida por sus propiedades relajantes y su delicada belleza. Sus pequeñas flores blancas con centro dorado traerán calma y frescura a tu espacio.",
    instructions: [
      "Remoja el papel semilla en agua durante 4 horas.",
      "Colócalo sobre tierra húmeda en una maceta con buen drenaje.",
      "Cúbrelo con una capa fina de tierra (máximo 0.5 cm).",
      "Mantén la tierra húmeda con un rociador.",
      "Ubícalo en un lugar con luz indirecta los primeros días.",
    ],
    germination: "7 a 14 días",
    watering: "Riego ligero y frecuente. Mantén la tierra húmeda pero nunca encharcada.",
    light: "Sol directo o semisombra. Prefiere al menos 4 horas de luz natural al día.",
    videoUrl: "#",
    bgAccent: "bg-secondary/50",
  },
  "flor-de-nube": {
    name: "Flor de Nube",
    image: florDeNubeImg,
    emoji: "☁️",
    description:
      "La flor de nube, también conocida como gypsophila, es una planta etérea y delicada. Sus diminutas flores blancas crean una nube de belleza suave, perfecta para decorar y alegrar cualquier rincón.",
    instructions: [
      "Remoja el papel semilla en agua durante 3 a 4 horas.",
      "Colócalo sobre tierra ligera y bien drenada.",
      "Cúbrelo con una capa muy fina de tierra o sustrato.",
      "Riega suavemente con un rociador.",
      "Ubícalo donde reciba buena luz natural.",
    ],
    germination: "10 a 20 días",
    watering: "Riego moderado. Deja que la tierra se seque ligeramente entre riegos.",
    light: "Sol pleno. Necesita al menos 6 horas de luz directa al día.",
    videoUrl: "#",
    bgAccent: "bg-accent/40",
  },
};

const Reveal = () => {
  const { plant } = useParams<{ plant: string }>();
  const data = plantData[plant as keyof typeof plantData];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-foreground mb-4">Planta no encontrada</h1>
          <Link to="/">
            <Button variant="elegant" size="lg">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero reveal */}
      <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="animate-fade-up text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
            Tu planta ha sido revelada
          </p>

          <div className="animate-fade-up-delay-1 w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden mx-auto mb-8 shadow-lg">
            <img
              src={data.image}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="animate-fade-up-delay-2 text-4xl sm:text-5xl md:text-6xl font-serif text-foreground mb-4">
            Tu planta es <em className="italic">{data.name}</em>
          </h1>

          <p className="animate-fade-up-delay-3 text-lg text-muted-foreground font-sans max-w-lg mx-auto leading-relaxed">
            {data.description}
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className={`py-16 sm:py-20 px-6 ${data.bgAccent}`}>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-background/80 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="font-serif text-sm text-foreground mb-1">Germinación</p>
            <p className="text-base font-sans text-muted-foreground">{data.germination}</p>
          </div>
          <div className="p-6 rounded-xl bg-background/80 text-center">
            <Droplets className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="font-serif text-sm text-foreground mb-1">Riego</p>
            <p className="text-sm font-sans text-muted-foreground">{data.watering}</p>
          </div>
          <div className="p-6 rounded-xl bg-background/80 text-center">
            <Sun className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="font-serif text-sm text-foreground mb-1">Luz</p>
            <p className="text-sm font-sans text-muted-foreground">{data.light}</p>
          </div>
        </div>
      </section>

      {/* Planting instructions */}
      <section className="py-16 sm:py-20 px-6 bg-background">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <Sprout className="w-6 h-6 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-serif text-foreground">
              Cómo plantar tu papel semilla
            </h2>
          </div>

          <ol className="space-y-4">
            {data.instructions.map((step, index) => (
              <li key={index} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-serif text-accent-foreground">
                  {index + 1}
                </span>
                <p className="font-sans text-foreground/80 text-base pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Video CTA */}
      <section className="py-16 sm:py-20 px-6 bg-secondary/30 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-serif text-foreground mb-4">
            ¿Prefieres verlo en video?
          </h2>
          <p className="text-muted-foreground font-sans mb-8">
            Mira nuestro tutorial paso a paso para plantar tu papel semilla.
          </p>
          <Button variant="hero" size="lg" asChild>
            <a href={data.videoUrl} target="_blank" rel="noopener noreferrer">
              Ver video tutorial
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background text-center">
        <p className="text-xs text-muted-foreground font-sans tracking-wide">
          Papel Semilla · Una experiencia que florece
        </p>
      </footer>
    </main>
  );
};

export default Reveal;
