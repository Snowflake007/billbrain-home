import type { AnalysisResult } from "@/lib/types";

function severityClasses(severity: AnalysisResult["severity"]) {
  if (severity === "Urgent") return "bg-red-50 text-urgent border-red-200";
  if (severity === "Investigate") return "bg-amber-50 text-watch border-amber-200";
  if (severity === "Watch") return "bg-yellow-50 text-watch border-yellow-200";
  return "bg-green-50 text-good border-green-200";
}

export function ResultCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">AI insight</p>
          <h3 className="text-2xl font-bold text-ink">{result.summary}</h3>
          <p className="text-sm text-slate-600">
            Parsed bill: {result.parsedBill.provider} · {result.parsedBill.billingPeriod}
          </p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${severityClasses(result.severity)}`}>
          {result.severity}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Anomaly</p>
          <p className="mt-2 text-3xl font-bold text-ink">{result.anomalyPercent}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Next bill forecast</p>
          <p className="mt-2 text-3xl font-bold text-ink">${result.forecastNextMonth}</p>
          <p className="mt-1 text-xs text-slate-500">
            Range ${result.forecastRange[0]} - ${result.forecastRange[1]}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Confidence</p>
          <p className="mt-2 text-3xl font-bold text-ink">{result.confidence}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-lg font-semibold text-ink">Likely causes</h4>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            {result.likelyCauses.map((cause) => (
              <li key={cause} className="rounded-xl bg-slate-50 px-3 py-2">
                {cause}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-lg font-semibold text-ink">Action plan</h4>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            {result.actionPlan.map((action) => (
              <li key={action} className="rounded-xl bg-slate-50 px-3 py-2">
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
