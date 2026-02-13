import { useNavigate } from "react-router-dom";

const options = [
  { number: "01", plant: "manzanilla" },
  { number: "02", plant: "flor-de-nube" },
  { number: "03", plant: "chia" },
];

const SelectPlant = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center py-20">
        <p className="animate-fade-up text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-sans">
          Último paso
        </p>

        <h1 className="animate-fade-up-delay-1 text-3xl sm:text-4xl font-serif text-foreground mb-4 leading-tight">
          Busca el número en tu papel semilla
        </h1>

        <p className="animate-fade-up-delay-2 text-base text-muted-foreground font-sans mb-12">
          Selecciona el número impreso en tu papel para revelar tu planta.
        </p>

        <div className="animate-fade-up-delay-3 flex flex-col gap-4">
          {options.map(({ number, plant }) => (
            <button
              key={number}
              onClick={() => navigate(`/revelacion/${plant}`)}
              className="group w-full h-16 rounded-xl border border-border bg-card text-foreground font-serif text-2xl tracking-widest transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SelectPlant;
