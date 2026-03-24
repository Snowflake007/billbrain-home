import type { AnalysisResult } from "@/lib/types";

function severityClasses(severity: AnalysisResult["severity"]) {
  if (severity === "Urgent") {
    return "border-red-500/50 bg-red-600/20 text-red-300";
  }
  if (severity === "Investigate") {
    return "border-amber-500/50 bg-amber-600/20 text-amber-300";
  }
  if (severity === "Watch") {
    return "border-yellow-500/50 bg-yellow-600/20 text-yellow-300";
  }
  return "border-[#0891b2]/50 bg-[#0891b2]/20 text-[#06b6d4]";
}

export function ResultCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4 rounded-[28px] border border-[#334155] bg-[#1a2847] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#06b6d4]">
            AI insight
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-white">
            {result.summary}
          </h3>
          <p className="mt-2 text-xs text-[#94a3b8]">
            Parsed bill: {result.parsedBill.provider} · {result.parsedBill.billingPeriod}
          </p>
        </div>

        <div
          className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${severityClasses(result.severity)}`}
        >
          {result.severity}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#334155] bg-white/5 p-3 transition hover:border-[#0891b2]/50 hover:bg-[#0891b2]/8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
            Anomaly
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{result.anomalyPercent}%</p>
        </div>

        <div className="rounded-2xl border border-[#334155] bg-white/5 p-3 transition hover:border-[#0891b2]/50 hover:bg-[#0891b2]/8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
            Forecast
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            ${result.forecastNextMonth}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            {result.forecastRange[0]} - {result.forecastRange[1]}
          </p>
        </div>

        <div className="rounded-2xl border border-[#334155] bg-white/5 p-3 transition hover:border-[#0891b2]/50 hover:bg-[#0891b2]/8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
            Confidence
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{result.confidence}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#334155] bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white">Likely causes</h4>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#cbd5e1]">
          {result.likelyCauses.map((cause) => (
            <li key={cause} className="rounded-2xl bg-[#0f172a]/40 px-3 py-2">
              {cause}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#334155] bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white">Action plan</h4>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#cbd5e1]">
          {result.actionPlan.map((action) => (
            <li key={action} className="rounded-2xl bg-[#0f172a]/40 px-3 py-2">
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}