import type { AnalysisResult } from "@/lib/types";

function severityClasses(severity: AnalysisResult["severity"]) {
  if (severity === "Urgent") {
    return "border-[rgba(255,155,155,0.35)] bg-[rgba(255,155,155,0.12)] text-[#ffe1e1]";
  }
  if (severity === "Investigate") {
    return "border-[rgba(255,212,121,0.35)] bg-[rgba(255,212,121,0.14)] text-[#ffe7ae]";
  }
  if (severity === "Watch") {
    return "border-[rgba(255,230,160,0.35)] bg-[rgba(255,230,160,0.12)] text-[#fff0bf]";
  }
  return "border-[rgba(153,202,60,0.35)] bg-[rgba(153,202,60,0.12)] text-[#e8ffd0]";
}

export function ResultCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="rounded-[24px] border border-[var(--az-line)] bg-[linear-gradient(135deg,rgba(153,202,60,0.16),rgba(255,255,255,0.04))] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              AI insight
            </p>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-[var(--az-text)]">
              {result.summary}
            </h3>
            <p className="mt-2 text-xs text-[var(--az-muted-2)]">
              Parsed bill: {result.parsedBill.provider} · {result.parsedBill.billingPeriod}
            </p>
          </div>

          <div
            className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${severityClasses(result.severity)}`}
          >
            {result.severity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
            Anomaly
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--az-text)]">
            {result.anomalyPercent}%
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
            Forecast
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--az-text)]">
            ${result.forecastNextMonth}
          </p>
          <p className="mt-1 text-[11px] text-[var(--az-muted-2)]">
            {result.forecastRange[0]} - {result.forecastRange[1]}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
            Confidence
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--az-text)]">
            {result.confidence}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-[var(--az-text)]">
          Likely causes
        </h4>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--az-muted)]">
          {result.likelyCauses.map((cause) => (
            <li
              key={cause}
              className="rounded-2xl border border-[var(--az-line)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--az-text-soft)]"
            >
              {cause}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-[var(--az-text)]">
          Action plan
        </h4>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--az-muted)]">
          {result.actionPlan.map((action) => (
            <li
              key={action}
              className="rounded-2xl border border-[var(--az-line)] bg-[var(--az-accent-soft)] px-3 py-2 text-[var(--az-text)]"
            >
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}