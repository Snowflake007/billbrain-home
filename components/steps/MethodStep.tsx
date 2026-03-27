import type { FlowState } from "@/hooks/useFormState";
import { INPUT_METHODS } from "@/lib/analyzerFormConstants";

interface MethodStepProps {
  form: FlowState;
  onUpdate: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}

export function MethodStep({ form, onUpdate }: MethodStepProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
          Step 1
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
          Choose how to start
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
          Pick one entry path. The app should branch cleanly here, not dump every field at once.
        </p>
      </div>

      <div className="space-y-3">
        {INPUT_METHODS.map((item) => {
          const selected = form.inputMethod === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onUpdate("inputMethod", item.key)}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                selected
                  ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)]"
                  : "border-[var(--az-line)] bg-[var(--az-surface)] hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--az-line)] bg-white/5 text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--az-text)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--az-muted)]">{item.description}</p>
                  </div>
                </div>

                <span className="rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--az-text-soft)]">
                  {item.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
