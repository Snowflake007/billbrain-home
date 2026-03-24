import { AnalyzerForm } from "@/components/AnalyzerForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-3 py-4 text-white sm:px-6">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-hidden rounded-[34px] border border-white/10 bg-[#11182b] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#11182b]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                BillBrain Home
              </p>
              <h1 className="mt-1 text-lg font-semibold text-white">
                Utility anomaly detective
              </h1>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              MVP demo
            </div>
          </div>
        </header>

        <div className="px-4 pb-28 pt-4">
          <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-400/15 via-cyan-400/10 to-transparent p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Why this is different
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-white">
              Not a bill tracker.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              It explains why a bill changed, whether it looks normal, and what
              to do next.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Focus
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  One strong AI workflow
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Bridge
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  Home now, Azility at scale
                </p>
              </div>
            </div>
          </section>

          <div className="mt-4">
            <AnalyzerForm />
          </div>
        </div>
      </div>
    </main>
  );
}