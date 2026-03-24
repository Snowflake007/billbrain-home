import { AnalyzerForm } from "@/components/AnalyzerForm";
import { SectionTitle } from "@/components/SectionTitle";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist bg-hero">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-white/85 p-8 shadow-soft backdrop-blur sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionTitle
              eyebrow="BillBrain Home"
              title="AI utility anomaly detective for one home"
              subtitle="This MVP is built to demo one thing really well: why a bill changed, whether it is normal, and what the user should do next."
            />
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              <div>
                <p className="font-semibold text-ink">Why this wins</p>
                <p>It is not a weak tracking app. It explains abnormal bills, predicts the next one, and recommends action.</p>
              </div>
              <div>
                <p className="font-semibold text-ink">B2B bridge</p>
                <p>One home here. Buildings, campuses, and portfolios in Azility.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
        <AnalyzerForm />
      </section>
    </main>
  );
}
