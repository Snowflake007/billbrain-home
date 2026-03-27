import { demoScenarios } from "@/lib/demoData";
import type { FlowState } from "@/hooks/useFormState";
import { DEMO_CARDS } from "@/lib/analyzerFormConstants";

type DemoId = keyof typeof demoScenarios;

interface DemoStepProps {
  form: FlowState;
  selectedDemo: DemoId;
  onSelectDemo: (id: DemoId) => void;
  onSetForm: (updater: (current: FlowState) => FlowState) => void;
  onSetUploadName: (name: string) => void;
  onClearWeatherError: () => void;
}

export function DemoStep({
  form,
  selectedDemo,
  onSelectDemo,
  onSetForm,
  onSetUploadName,
  onClearWeatherError,
}: DemoStepProps) {
  const loadScenario = (id: DemoId) => {
    const scenario = demoScenarios[id];
    if (!scenario) return;

    onSelectDemo(id);
    onSetForm((current) => ({
      ...current,
      ...scenario,
      inputMethod: "demo",
    }));
    onSetUploadName(scenario.fileName || "demo_bill.pdf");
    onClearWeatherError();
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
          Step 2
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
          Choose a demo
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
          Good. Now the demo path gets its own screen instead of being jammed into the intro.
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_CARDS.map((card) => {
          const selected = selectedDemo === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => loadScenario(card.id)}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                selected
                  ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)]"
                  : "border-[var(--az-line)] bg-[var(--az-surface)] hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--az-text)]">{card.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--az-muted)]">{card.description}</p>
                </div>

                {selected ? (
                  <span className="rounded-full border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--az-text)]">
                    Selected
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
