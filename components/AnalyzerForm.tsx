"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, BillInput, WeatherLookupResult } from "@/lib/types";
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
  locationQuery: "Montreal",
  weatherSummary: "Recent weather appears colder than the prior comparison window.",
};

export function AnalyzerForm() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [uploadName, setUploadName] = useState(defaultState.fileName || "");

  const deltaPreview = useMemo(() => {
    const percent =
      ((form.currentTotal - form.previousTotal) / Math.max(form.previousTotal, 1)) * 100;
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
    setWeatherError("");
    setResult(null);
  }

  async function handleWeatherLookup() {
    if (!form.locationQuery?.trim()) {
      setWeatherError("Enter a city or postal code first.");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await fetch(
        `/api/weather?query=${encodeURIComponent(form.locationQuery.trim())}`
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Weather lookup failed.");
      }

      const data = (await response.json()) as WeatherLookupResult;

      setForm((current) => ({
        ...current,
        weatherDeltaPercent: data.deltaPercent,
        weatherSummary: data.summary,
        locationQuery: data.resolvedName,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load weather data.";
      setWeatherError(message);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileName: uploadName || form.fileName,
        }),
      });

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-[28px] border border-[#334155] bg-[#1a2847] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#06b6d4]">
            Demo setup
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Run one sharp story.
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">
            Load a scenario, optionally pull real weather context, then analyze.
          </p>

          <div className="mt-4">
            <ScenarioButtons onPick={loadScenario} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#334155] bg-[#1a2847] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Upload bill</p>
              <p className="text-xs text-[#94a3b8]">
                Prototype file input for demo realism
              </p>
            </div>
            <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#cbd5e1]">
              {uploadName || "demo_bill.pdf"}
            </div>
          </div>

          <input
            className="mt-4 block w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-sm text-[#e2e8f0] file:mr-3"
            type="file"
            accept=".pdf,image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setUploadName(file?.name || "demo_bill.pdf");
            }}
          />
        </section>

        <section className="rounded-[28px] border border-[#334155] bg-[#1a2847] p-4">
          <p className="text-sm font-semibold text-white">Weather context</p>
          <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
            Auto-fill the weather shift from a city instead of guessing it.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-[#cbd5e1]">
              City or postal code
              <input
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white placeholder:text-[#64748b]"
                type="text"
                value={form.locationQuery || ""}
                onChange={(event) => update("locationQuery", event.target.value)}
                placeholder="Montreal"
              />
            </label>

            <button
              type="button"
              onClick={handleWeatherLookup}
              disabled={weatherLoading}
              className="w-full rounded-2xl border border-[#0891b2]/30 bg-[#0891b2]/10 px-4 py-3 text-sm font-semibold text-[#06b6d4] transition hover:bg-[#0891b2]/20 disabled:opacity-60"
            >
              {weatherLoading ? "Loading weather..." : "Use Open-Meteo weather"}
            </button>

            <div className="rounded-2xl border border-[#334155] bg-[#0f172a] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
                Weather delta vs previous window
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {form.weatherDeltaPercent}%
              </p>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">
                {form.weatherSummary || "No weather summary loaded yet."}
              </p>
              {weatherError ? (
                <p className="mt-2 text-sm text-red-400">{weatherError}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#334155] bg-[#1a2847] p-4">
          <p className="text-sm font-semibold text-white">Bill details</p>

          <div className="mt-4 grid gap-3">
            <label className="text-sm font-medium text-[#cbd5e1]">
              Utility type
              <select
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                value={form.utilityType}
                onChange={(event) =>
                  update("utilityType", event.target.value as FormState["utilityType"])
                }
              >
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="gas">Gas</option>
              </select>
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Home type
              <select
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                value={form.homeType}
                onChange={(event) =>
                  update("homeType", event.target.value as FormState["homeType"])
                }
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="duplex">Duplex</option>
              </select>
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Current total ($)
              <input
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                type="number"
                step="0.01"
                value={form.currentTotal}
                onChange={(event) => update("currentTotal", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Previous total ($)
              <input
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                type="number"
                step="0.01"
                value={form.previousTotal}
                onChange={(event) => update("previousTotal", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Current usage
              <input
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                type="number"
                step="0.01"
                value={form.currentUsage}
                onChange={(event) => update("currentUsage", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Previous usage
              <input
                className="mt-2 w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white"
                type="number"
                step="0.01"
                value={form.previousUsage}
                onChange={(event) => update("previousUsage", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[#cbd5e1]">
              Voice note / user context
              <textarea
                className="mt-2 min-h-[110px] w-full rounded-2xl border border-[#334155] bg-white/5 px-3 py-3 text-white placeholder:text-[#64748b]"
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
                placeholder="Example: I used a space heater, had guests over, or left town for a week."
              />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#334155] bg-[#1a2847] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
            Live preview
          </p>
          <p className="mt-2 text-xl font-semibold text-white">{deltaPreview}</p>
          <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">
            This is the panel you use during the demo to show that the app is
            already reacting before analysis.
          </p>
        </section>

        <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 rounded-[24px] border border-[#334155] bg-[#1a2847]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[18px] bg-[#0891b2] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#0e7490] hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze bill"}
          </button>
        </div>
      </form>

      {result ? (
        <ResultCard result={result} />
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#334155] bg-[#1a2847] p-5 text-sm leading-6 text-[#cbd5e1]">
          No result yet. Load a scenario, pull weather, and tap{" "}
          <span className="font-semibold text-white">Analyze bill</span>.
        </div>
      )}
    </div>
  );
}