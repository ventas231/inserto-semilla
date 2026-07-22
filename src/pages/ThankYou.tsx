import growingPlantsImg from "@/assets/growing-plants.jpg";

const ThankYou = () => {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-10 left-5 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-5 w-56 h-56 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <div className="max-w-lg w-full text-center animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-5xl">🌱</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4 leading-tight">
            ¡Gracias! Ya quedaste registrado. 🌱
          </h1>

          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 mt-8 space-y-5">
            <p className="text-lg text-foreground font-serif leading-relaxed">
              ¡Todo listo! 🌱
            </p>
            <p className="text-base text-muted-foreground font-sans leading-relaxed">
              Ahora revisa tu correo electrónico. Ahí encontrarás toda la información sobre la plantita que llegó en tu papel semilla y cómo empezar a cultivarla.
            </p>
            <div className="border-t border-border/50 pt-5">
              <p className="text-sm text-muted-foreground/80 font-sans leading-relaxed">
                📬 Si no ves el correo en tu bandeja principal, revisa también tu carpeta de promociones o spam.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl overflow-hidden shadow-lg max-w-sm mx-auto">
            <img
              src={growingPlantsImg}
              alt="Plantitas creciendo en macetas biodegradables"
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          </div>

          <div className="mt-10 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 max-w-md mx-auto space-y-5">
            <div className="text-center space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-sans font-medium tracking-wide">
                Regalo especial
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground leading-tight">
                $100 MXN de dinero electrónico
              </h2>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Para tu siguiente compra en productos SpecialFit Socks. Válido al comprar 2 o más artículos.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 bg-background/60 border border-dashed border-primary/30 rounded-xl px-5 py-4">
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Código:</span>
              <span className="text-xl sm:text-2xl font-serif text-foreground tracking-widest">100GRATIS</span>
            </div>

            <a
              href="https://specialfitsocks.com/discount/100GRATIS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full h-13 px-6 rounded-xl bg-primary text-primary-foreground font-sans text-base font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              Visitar tienda oficial
            </a>

            <p className="text-xs text-muted-foreground font-sans text-center leading-relaxed">
              Al usar este enlace, el descuento de $100 MXN se aplicará automáticamente en tu carrito.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 font-sans mt-12">
            Papel Semilla · Una experiencia que florece
          </p>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
