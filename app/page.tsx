import { AnalyzerForm } from "@/components/AnalyzerForm";
import { PhoneShell } from "@/components/PhoneShell";

export default function HomePage() {
  return (
    <PhoneShell
      title="Utility anomaly detective"
      subtitle="Consumer AI for abnormal bills, forecasts, and action plans."
    >
      <div className="px-4 pb-28 pt-4">
        <section className="rounded-[28px] border border-[var(--az-line)] bg-[linear-gradient(135deg,rgba(153,202,60,0.18),rgba(255,255,255,0.04)_60%,rgba(255,255,255,0.02))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--az-accent)]">
            Azility-aligned concept
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-[var(--az-text)]">
            Smarter energy management.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
            Explain utility spikes, estimate what comes next, and guide action in one mobile-first flow.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Focus
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                One strong AI path
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Inputs
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                Bills + weather
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Output
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                Clear action plan
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4">
          <AnalyzerForm />
        </div>
      </div>
    </PhoneShell>
  );
}