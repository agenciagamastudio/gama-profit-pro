export function BrandHeader() {
  return (
    <div className="relative z-10 px-5 md:px-10 mt-10 md:mt-16">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            Gama<span className="brand-dot">.</span>
          </div>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.18em] text-muted-foreground hidden md:block">
          Press · Precificação inteligente
        </div>
      </div>
    </div>
  );
}
