"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, BillInput } from "@/lib/types";
import { demoScenarios } from "@/lib/demoData";
import { ScenarioButtons } from "@/components/ScenarioButtons";
import { ResultCard } from "@/components/ResultCard";

type FormState = BillInput;

const defaultState: FormState = {
  utilityType: "electricity",
  homeType: "house",
  currentTotal: 190,
  previousTotal: 150,
  currentUsage: 1200,
  previousUsage: 980,
  weatherDeltaPercent: -8,
  note: "It got colder and I worked from home more often.",
  fileName: "demo_bill.pdf",
};

export function AnalyzerForm() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadName, setUploadName] = useState(defaultState.fileName || "");

  const deltaPreview = useMemo(() => {
    const percent = ((form.currentTotal - form.previousTotal) / Math.max(form.previousTotal, 1)) * 100;
    return `${Math.round(percent * 10) / 10}% vs previous bill`;
  }, [form.currentTotal, form.previousTotal]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadScenario(id: string) {
    const scenario = demoScenarios[id];
    if (!scenario) return;
    setForm(scenario);
    setUploadName(scenario.fileName || "demo_bill.pdf");
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileName: uploadName || form.fileName }),
      });

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-card p-6 shadow-soft">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Prototype controls</p>
            <h3 className="mt-2 text-2xl font-bold text-ink">Run one strong AI demo, not ten half-baked ones.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              For the MVP, the upload exists for the demo feel. The real star is the anomaly explanation engine.
            </p>
          </div>

          <ScenarioButtons onPick={loadScenario} />

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className="block text-sm font-medium text-slate-700">Upload bill file</label>
            <input
              className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setUploadName(file?.name || "demo_bill.pdf");
              }}
            />
            <p className="mt-2 text-xs text-slate-500">Current file: {uploadName || "demo_bill.pdf"}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Utility type
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                value={form.utilityType}
                onChange={(event) => update("utilityType", event.target.value as FormState["utilityType"])}
              >
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="gas">Gas</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Home type
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                value={form.homeType}
                onChange={(event) => update("homeType", event.target.value as FormState["homeType"])}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="duplex">Duplex</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Current total ($)
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                type="number"
                step="0.01"
                value={form.currentTotal}
                onChange={(event) => update("currentTotal", Number(event.target.value))}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Previous total ($)
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                type="number"
                step="0.01"
                value={form.previousTotal}
                onChange={(event) => update("previousTotal", Number(event.target.value))}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Current usage
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                type="number"
                step="0.01"
                value={form.currentUsage}
                onChange={(event) => update("currentUsage", Number(event.target.value))}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Previous usage
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                type="number"
                step="0.01"
                value={form.previousUsage}
                onChange={(event) => update("previousUsage", Number(event.target.value))}
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Weather delta vs last month (%)
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              type="number"
              step="1"
              value={form.weatherDeltaPercent}
              onChange={(event) => update("weatherDeltaPercent", Number(event.target.value))}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Voice note / user context
            <textarea
              className="min-h-[112px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Example: I used a space heater, had guests over, or left town for a week."
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Live MVP preview: {deltaPreview}</p>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze bill"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-card p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Demo talking points</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>1. Upload a bill or load one of the three demo cases.</li>
            <li>2. Show the anomaly score and plain-language explanation.</li>
            <li>3. Show ranked causes and a repair-vs-wait action plan.</li>
            <li>4. Close by saying Azility is the multi-site version of the same logic.</li>
          </ul>
        </div>

        {result ? (
          <ResultCard result={result} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600 shadow-soft">
            No result yet. Use a demo scenario, hit <span className="font-semibold text-ink">Analyze bill</span>, and this panel becomes your presentation money shot.
          </div>
        )}
      </div>
    </div>
  );
}
