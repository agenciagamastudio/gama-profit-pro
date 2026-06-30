import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import { BrandHeader } from "@/components/pricer/brand-header";
import { OrbBackdrop } from "@/components/pricer/orb-backdrop";
import { StepIndicator } from "@/components/pricer/step-indicator";
import { StepOne } from "@/components/pricer/step-one";
import { StepThree } from "@/components/pricer/step-three";
import { StepTwo } from "@/components/pricer/step-two";
import { TopActions } from "@/components/pricer/top-actions";
import { usePricer } from "@/components/pricer/use-pricer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gama PRESS — Qual produto vamos vender hoje?" },
      { name: "description", content: "Calcule o preço perfeito do seu produto em segundos." },
    ],
  }),
  component: HomePricer,
});

function HomePricer() {
  const p = usePricer();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 relative overflow-hidden">
        <OrbBackdrop />
        <TopActions onReset={p.reset} />
        <BrandHeader />

        <section className="relative z-10 px-5 md:px-10 pb-28 md:pb-16 max-w-6xl mx-auto w-full">
          {p.step === 1 && (
            <StepOne
              costs={p.costs}
              setCosts={p.setCosts}
              onNext={() => p.setStep(2)}
              totalCost={p.totalCost}
            />
          )}
          {p.step === 2 && (
            <StepTwo
              name={p.name}
              setName={p.setName}
              category={p.category}
              setCategory={p.setCategory}
              image={p.image}
              setImage={p.setImage}
              onBack={() => p.setStep(1)}
              onNext={() => p.setStep(3)}
            />
          )}
          {p.step === 3 && (
            <StepThree
              name={p.name}
              category={p.category}
              image={p.image}
              totalCost={p.totalCost}
              suggested={p.suggested}
              profit={p.profit}
              margin={p.margin}
              setMargin={p.setMargin}
              onSave={p.save}
              onRestart={p.reset}
            />
          )}

          <StepIndicator step={p.step} />
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
