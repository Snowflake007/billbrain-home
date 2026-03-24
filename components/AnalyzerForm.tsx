"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult, BillInput, WeatherLookupResult } from "@/lib/types";
import { demoScenarios } from "@/lib/demoData";
import { ScenarioButtons } from "@/components/ScenarioButtons";

type FormState = BillInput;

const STORAGE_KEY = "billbrain:lastAnalysis";

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
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultState);
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

    try {
      const payload = {
        ...form,
        fileName: uploadName || form.fileName,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AnalysisResult;

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          result: data,
          form: payload,
        })
      );

      router.push("/analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
          Scenario loader
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--az-text)]">
          Pick a clean demo path
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
          Start with one scenario, enrich it with weather, then run the analysis screen.
        </p>

        <div className="mt-4">
          <ScenarioButtons onPick={loadScenario} />
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--az-text)]">
              Bill upload
            </p>
            <p className="text-xs text-[var(--az-muted-2)]">
              Demo-first input for the phone flow
            </p>
          </div>

          <div className="rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-xs text-[var(--az-text-soft)]">
            {uploadName || "demo_bill.pdf"}
          </div>
        </div>

        <input
          className="mt-4 block w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-sm text-[var(--az-text)]"
          type="file"
          accept=".pdf,image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setUploadName(file?.name || "demo_bill.pdf");
          }}
        />
      </section>

      <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--az-text)]">
          Weather context
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--az-muted-2)]">
          Pull real recent weather so the explanation feels grounded.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-[var(--az-text)]">
            City or postal code
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
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
            className="w-full rounded-[18px] border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--az-text)] transition hover:bg-[var(--az-accent-soft-2)] disabled:opacity-60"
          >
            {weatherLoading ? "Loading weather..." : "Use Open-Meteo weather"}
          </button>

          <div className="rounded-2xl border border-[var(--az-line)] bg-[rgba(255,255,255,0.03)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
              Weather delta
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--az-text)]">
              {form.weatherDeltaPercent}%
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
              {form.weatherSummary || "No weather summary loaded yet."}
            </p>

            {weatherError ? (
              <p className="mt-2 text-sm text-[#ffe1e1]">{weatherError}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--az-text)]">
          Bill details
        </p>

        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium text-[var(--az-text)]">
            Utility type
            <select
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
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

          <label className="text-sm font-medium text-[var(--az-text)]">
            Home type
            <select
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
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

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-[var(--az-text)]">
              Current total ($)
              <input
                className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
                type="number"
                step="0.01"
                value={form.currentTotal}
                onChange={(event) => update("currentTotal", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[var(--az-text)]">
              Previous total ($)
              <input
                className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
                type="number"
                step="0.01"
                value={form.previousTotal}
                onChange={(event) => update("previousTotal", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-[var(--az-text)]">
              Current usage
              <input
                className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
                type="number"
                step="0.01"
                value={form.currentUsage}
                onChange={(event) => update("currentUsage", Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-[var(--az-text)]">
              Previous usage
              <input
                className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
                type="number"
                step="0.01"
                value={form.previousUsage}
                onChange={(event) => update("previousUsage", Number(event.target.value))}
              />
            </label>
          </div>

          <label className="text-sm font-medium text-[var(--az-text)]">
            User context
            <textarea
              className="mt-2 min-h-[110px] w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Example: I used a space heater, had guests over, or left town for a week."
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
          Live preview
        </p>
        <p className="mt-2 text-xl font-semibold text-[var(--az-text)]">
          {deltaPreview}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
          This pre-analysis cue makes the app feel responsive before the dedicated analysis screen.
        </p>
      </section>

      <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 rounded-[24px] border border-[var(--az-line)] bg-[rgba(50,61,80,0.94)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze bill"}
        </button>
      </div>
    </form>
  );
}