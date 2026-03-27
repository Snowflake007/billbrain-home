import { AzilityPremiumCard } from "@/components/AzilityPremiumCard";

export function WelcomeStep() {
  return (
    <section className="space-y-4">
      <div className="rounded-[30px] border border-[var(--az-line)] bg-[linear-gradient(135deg,rgba(153,202,60,0.16),rgba(255,255,255,0.04)_60%,rgba(255,255,255,0.02))] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
          BillBrain Home
        </p>

        <h2 className="mt-3 text-[30px] font-bold leading-[1.08] text-[var(--az-text)]">
          Explain utility spikes fast.
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--az-muted)]">
          The app should help users understand why a bill changed, what likely caused it,
          and what they should do next — without forcing them through one giant ugly page.
        </p>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--az-text)]">Upload, type, or connect data</p>
          </div>
          <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--az-text)]">Get an AI explanation and action plan</p>
          </div>
          <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--az-text)]">Push premium monitoring with Azility</p>
          </div>
        </div>
      </div>

      <AzilityPremiumCard />
    </section>
  );
}
