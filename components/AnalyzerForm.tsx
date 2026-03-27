"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AnalysisResult,
  BillExtractionResult,
  BillInput,
  WeatherLookupResult,
} from "@/lib/types";
import { demoScenarios } from "@/lib/demoData";
import { AzilityPremiumCard } from "@/components/AzilityPremiumCard";

type DemoId = keyof typeof demoScenarios;

type FlowState = BillInput & {
  inputMethod: "manual" | "image" | "connect" | "demo";
  providerName: string;
  accountLabel: string;
};

type StepKey = "welcome" | "method" | "demo" | "details" | "context" | "review";

const STORAGE_KEY = "billbrain:lastAnalysis";

const steps: StepKey[] = ["welcome", "method", "demo", "details", "context", "review"];

const defaultState: FlowState = {
  inputMethod: "manual",
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
  providerName: "Hydro-Québec",
  accountLabel: "home@example.com",
  extractedProvider: undefined,
  extractedBillingPeriod: undefined,
};

const providerOptions = ["Hydro-Québec", "Énergir", "Veolia", "Custom API"] as const;
const utilityOptions: Array<BillInput["utilityType"]> = ["electricity", "water", "gas"];
const homeOptions: Array<BillInput["homeType"]> = ["apartment", "house", "duplex"];

const inputMethods = [
  {
    key: "manual" as const,
    title: "Input manually",
    description: "Type in the bill totals and usage yourself.",
    badge: "Quick",
    icon: "⌨️",
  },
  {
    key: "image" as const,
    title: "Upload picture or PDF",
    description: "Start from a photo, screenshot, or bill document.",
    badge: "Realistic",
    icon: "📸",
  },
  {
    key: "connect" as const,
    title: "Connect via MCP / API",
    description: "Simulate a provider or system connection for premium workflows.",
    badge: "Premium",
    icon: "🔌",
  },
  {
    key: "demo" as const,
    title: "Load demo",
    description: "Use one of the prepared demo scenarios for the pitch.",
    badge: "Pitch",
    icon: "🎯",
  },
];

const demoCards: Array<{
  id: DemoId;
  title: string;
  description: string;
}> = [
  {
    id: "heatingSpike",
    title: "Heating spike",
    description: "Cold-weather energy jump with likely electric heating impact.",
  },
  {
    id: "waterLeak",
    title: "Water leak",
    description: "Usage spike without occupancy change, pointing to a possible leak.",
  },
  {
    id: "feeJump",
    title: "Fee jump",
    description: "Small usage change but a higher bill, suggesting rate or fee issues.",
  },
];

function formatUtility(value: BillInput["utilityType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatHome(value: BillInput["homeType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AnalyzerForm() {
  const router = useRouter();

  const [form, setForm] = useState<FlowState>(defaultState);
  const [selectedDemo, setSelectedDemo] = useState<DemoId>("heatingSpike");
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [uploadName, setUploadName] = useState(defaultState.fileName || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);

  const currentStep = steps[stepIndex];

  const deltaPreview = useMemo(() => {
    const percent =
      ((form.currentTotal - form.previousTotal) / Math.max(form.previousTotal, 1)) * 100;
    const rounded = Math.round(percent * 10) / 10;
    const direction = rounded >= 0 ? "up" : "down";
    return `${Math.abs(rounded)}% ${direction} vs previous bill`;
  }, [form.currentTotal, form.previousTotal]);

  function update<K extends keyof FlowState>(key: K, value: FlowState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadScenario(id: DemoId) {
    const scenario = demoScenarios[id];
    if (!scenario) return;

    setSelectedDemo(id);
    setForm((current) => ({
      ...current,
      ...scenario,
      inputMethod: "demo",
    }));
    setUploadName(scenario.fileName || "demo_bill.pdf");
    setWeatherError("");
  }

  function goNext() {
    if (currentStep === "welcome") {
      setStepIndex(steps.indexOf("method"));
      return;
    }

    if (currentStep === "method") {
      if (form.inputMethod === "demo") {
        setStepIndex(steps.indexOf("demo"));
      } else {
        setStepIndex(steps.indexOf("details"));
      }
      return;
    }

    if (currentStep === "demo") {
      setStepIndex(steps.indexOf("details"));
      return;
    }

    if (currentStep === "details") {
      setStepIndex(steps.indexOf("context"));
      return;
    }

    if (currentStep === "context") {
      setStepIndex(steps.indexOf("review"));
    }
  }

  function goBack() {
    if (currentStep === "method") {
      setStepIndex(steps.indexOf("welcome"));
      return;
    }

    if (currentStep === "demo") {
      setStepIndex(steps.indexOf("method"));
      return;
    }

    if (currentStep === "details") {
      if (form.inputMethod === "demo") {
        setStepIndex(steps.indexOf("demo"));
      } else {
        setStepIndex(steps.indexOf("method"));
      }
      return;
    }

    if (currentStep === "context") {
      setStepIndex(steps.indexOf("details"));
      return;
    }

    if (currentStep === "review") {
      setStepIndex(steps.indexOf("context"));
    }
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

  async function handleExtractFromUpload() {
    if (!uploadedFile) {
      setExtractError("Pick an image or PDF first.");
      return;
    }

    setExtracting(true);
    setExtractError("");
    setExtractWarnings([]);

    try {
      const body = new FormData();
      body.set("file", uploadedFile);

      const response = await fetch("/api/extract-bill", {
        method: "POST",
        body,
      });

      const data = (await response.json()) as
        | BillExtractionResult
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error || "Extraction failed." : "Extraction failed."
        );
      }

      if (!("utilityType" in data)) {
        throw new Error("Invalid extraction response.");
      }

      setExtractWarnings(data.warnings || []);

      setForm((current) => ({
        ...current,
        utilityType:
          data.utilityType !== "unknown" ? data.utilityType : current.utilityType,
        currentTotal: data.currentTotal ?? current.currentTotal,
        previousTotal: data.previousTotal ?? current.previousTotal,
        currentUsage: data.currentUsage ?? current.currentUsage,
        previousUsage: data.previousUsage ?? current.previousUsage,
        locationQuery: data.serviceAddressCity ?? current.locationQuery,
        extractedProvider: data.provider ?? current.extractedProvider,
        extractedBillingPeriod:
          data.billingPeriod ?? current.extractedBillingPeriod,
      }));
    } catch (error) {
      setExtractError(
        error instanceof Error ? error.message : "Could not read the uploaded bill."
      );
    } finally {
      setExtracting(false);
    } 
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: BillInput = {
        utilityType: form.utilityType,
        homeType: form.homeType,
        currentTotal: form.currentTotal,
        previousTotal: form.previousTotal,
        currentUsage: form.currentUsage,
        previousUsage: form.previousUsage,
        weatherDeltaPercent: form.weatherDeltaPercent,
        note: form.note,
        fileName: uploadName || form.fileName,
        locationQuery: form.locationQuery,
        weatherSummary: form.weatherSummary,
        extractedProvider: form.extractedProvider,
        extractedBillingPeriod: form.extractedBillingPeriod,
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

  function renderStep() {
    if (currentStep === "welcome") {
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

    if (currentStep === "method") {
      return (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              Step 1
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
              Choose how to start
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
              Pick one entry path. The app should branch cleanly here, not dump every field at once.
            </p>
          </div>

          <div className="space-y-3">
            {inputMethods.map((item) => {
              const selected = form.inputMethod === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => update("inputMethod", item.key)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    selected
                      ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)]"
                      : "border-[var(--az-line)] bg-[var(--az-surface)] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--az-line)] bg-white/5 text-xl">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[var(--az-text)]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--az-muted)]">{item.description}</p>
                      </div>
                    </div>

                    <span className="rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--az-text-soft)]">
                      {item.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    if (currentStep === "demo") {
      return (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
              Choose a demo
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
              Good. Now the demo path gets its own screen instead of being jammed into the intro.
            </p>
          </div>

          <div className="space-y-3">
            {demoCards.map((card) => {
              const selected = selectedDemo === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => loadScenario(card.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    selected
                      ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)]"
                      : "border-[var(--az-line)] bg-[var(--az-surface)] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[var(--az-text)]">{card.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--az-muted)]">{card.description}</p>
                    </div>

                    {selected ? (
                      <span className="rounded-full border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--az-text)]">
                        Selected
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    if (currentStep === "details") {
      return (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              {form.inputMethod === "demo" ? "Step 3" : "Step 2"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
              Add the bill source
            </h2>
          </div>

          {form.inputMethod === "image" ? (
            <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--az-text)]">Upload bill or screenshot</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--az-muted-2)]">
                    Use PDF, photo, or invoice image.
                  </p>
                </div>

                <div className="rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-xs text-[var(--az-text-soft)]">
                  {uploadName || "No file"}
                </div>
              </div>

              <input
                className="mt-4 block w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-sm text-[var(--az-text)]"
                type="file"
                accept=".pdf,image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setUploadedFile(file);
                  setUploadName(file?.name || "demo_bill.pdf");
                  setExtractError("");
                  setExtractWarnings([]);
                }}
              />
              <button
                type="button"
                onClick={handleExtractFromUpload}
                disabled={!uploadedFile || extracting}
                className="mt-3 w-full rounded-[18px] border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--az-text)] transition hover:bg-[var(--az-accent-soft-2)] disabled:opacity-60"
              >
                {extracting ? "Reading bill with AI..." : "Read bill with AI"}
              </button>

              {extractError ? (
                <p className="mt-3 text-sm text-[#ffe1e1]">{extractError}</p>
              ) : null}

              {form.currentUsage || form.currentTotal ? (
                <div className="mt-3 rounded-2xl border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--az-text)]">
                    📊 Extracted data
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    {form.currentTotal ? (
                      <div>
                        <p className="text-xs text-[var(--az-muted)]">Current Total</p>
                        <p className="mt-1 font-semibold text-[var(--az-text)]">${form.currentTotal}</p>
                      </div>
                    ) : null}
                    {form.previousTotal ? (
                      <div>
                        <p className="text-xs text-[var(--az-muted)]">Previous Total</p>
                        <p className="mt-1 font-semibold text-[var(--az-text)]">${form.previousTotal}</p>
                      </div>
                    ) : null}
                    {form.currentUsage ? (
                      <div>
                        <p className="text-xs text-[var(--az-muted)]">Current Usage</p>
                        <p className="mt-1 font-semibold text-[var(--az-text)]">
                          {form.currentUsage} {form.utilityType === "water" ? "gal" : form.utilityType === "electricity" ? "kWh" : "m³"}
                        </p>
                      </div>
                    ) : null}
                    {form.previousUsage ? (
                      <div>
                        <p className="text-xs text-[var(--az-muted)]">Previous Usage</p>
                        <p className="mt-1 font-semibold text-[var(--az-text)]">
                          {form.previousUsage} {form.utilityType === "water" ? "gal" : form.utilityType === "electricity" ? "kWh" : "m³"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {form.extractedProvider || form.locationQuery ? (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)] text-xs text-[var(--az-muted)]">
                      {form.extractedProvider && <p>Provider: {form.extractedProvider}</p>}
                      {form.locationQuery && <p>Location: {form.locationQuery}</p>}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {extractWarnings.length ? (
                <div className="mt-3 rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                    ⚠️ Extraction notes
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--az-muted)]">
                    {extractWarnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {form.inputMethod === "connect" ? (
            <div className="space-y-4 rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--az-text)]">Connected billing source</p>
                <p className="mt-1 text-xs leading-5 text-[var(--az-muted-2)]">
                  This is the premium-style connected path.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {providerOptions.map((provider) => {
                  const selected = form.providerName === provider;

                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => update("providerName", provider)}
                      className={`rounded-[20px] border px-4 py-4 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] text-[var(--az-text)]"
                          : "border-[var(--az-line)] bg-white/5 text-[var(--az-text-soft)] hover:bg-white/10"
                      }`}
                    >
                      {provider}
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm font-medium text-[var(--az-text)]">
                Account or MCP identifier
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
                  type="text"
                  value={form.accountLabel}
                  onChange={(event) => update("accountLabel", event.target.value)}
                  placeholder="building-204 / home@example.com"
                />
              </label>
            </div>
          ) : null}

          {form.inputMethod === "demo" ? (
            <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
              <p className="text-sm font-semibold text-[var(--az-text)]">Loaded demo</p>
              <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
                {demoCards.find((card) => card.id === selectedDemo)?.title} is loaded. You can still tweak the numbers below.
              </p>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-sm font-semibold text-[var(--az-text)]">Bill snapshot</p>

            <div className="mt-4 grid gap-3">
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
            </div>
          </div>
        </section>
      );
    }

    if (currentStep === "context") {
      return (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              {form.inputMethod === "demo" ? "Step 4" : "Step 3"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
              Add context
            </h2>
          </div>

          <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-sm font-semibold text-[var(--az-text)]">Utility type</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {utilityOptions.map((option) => {
                const selected = form.utilityType === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("utilityType", option)}
                    className={`rounded-[20px] border px-3 py-4 text-sm font-semibold transition ${
                      selected
                        ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] text-[var(--az-text)]"
                        : "border-[var(--az-line)] bg-white/5 text-[var(--az-text-soft)] hover:bg-white/10"
                    }`}
                  >
                    {formatUtility(option)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-sm font-semibold text-[var(--az-text)]">Home type</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {homeOptions.map((option) => {
                const selected = form.homeType === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("homeType", option)}
                    className={`rounded-[20px] border px-3 py-4 text-sm font-semibold transition ${
                      selected
                        ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] text-[var(--az-text)]"
                        : "border-[var(--az-line)] bg-white/5 text-[var(--az-text-soft)] hover:bg-white/10"
                    }`}
                  >
                    {formatHome(option)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-sm font-semibold text-[var(--az-text)]">Weather context</p>

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
          </div>

          <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <label className="text-sm font-medium text-[var(--az-text)]">
              User context
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
                placeholder="Example: I used a space heater, had guests over, or left town for a week."
              />
            </label>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
            {form.inputMethod === "demo" ? "Step 5" : "Step 4"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
            Review before analysis
          </h2>
        </div>

        <div className="rounded-[28px] border border-[var(--az-line)] bg-[linear-gradient(135deg,rgba(153,202,60,0.16),rgba(255,255,255,0.04))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
            Live preview
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--az-text)]">{deltaPreview}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
            {form.inputMethod === "connect"
              ? `Connected source: ${form.providerName} · ${form.accountLabel || "No account label yet"}`
              : form.inputMethod === "image"
                ? `Uploaded source: ${uploadName || "No file selected yet"}`
                : form.inputMethod === "demo"
                  ? `Loaded demo: ${demoCards.find((card) => card.id === selectedDemo)?.title}`
                  : "Manual numbers entered directly in-app."}
          </p>
          {form.extractedProvider || form.extractedBillingPeriod ? (
            <p className="mt-2 text-xs leading-5 text-[var(--az-muted-2)]">
              Parsed bill: {form.extractedProvider || "Unknown provider"}
              {form.extractedBillingPeriod ? ` · ${form.extractedBillingPeriod}` : ""}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">Utility</p>
            <p className="mt-2 text-base font-semibold text-[var(--az-text)]">{formatUtility(form.utilityType)}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">Home</p>
            <p className="mt-2 text-base font-semibold text-[var(--az-text)]">{formatHome(form.homeType)}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">Current total</p>
            <p className="mt-2 text-base font-semibold text-[var(--az-text)]">${form.currentTotal}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">Previous total</p>
            <p className="mt-2 text-base font-semibold text-[var(--az-text)]">${form.previousTotal}</p>
          </div>
        </div>

        <AzilityPremiumCard compact />
      </section>
    );
  }

  const isWelcome = currentStep === "welcome";
  const isReview = currentStep === "review";
  const progressSteps = form.inputMethod === "demo" ? 5 : 4;

  let progressIndex = 0;
  if (currentStep === "method") progressIndex = 1;
  if (currentStep === "demo") progressIndex = 2;
  if (currentStep === "details") progressIndex = form.inputMethod === "demo" ? 3 : 2;
  if (currentStep === "context") progressIndex = form.inputMethod === "demo" ? 4 : 3;
  if (currentStep === "review") progressIndex = form.inputMethod === "demo" ? 5 : 4;

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col px-4 pb-4 pt-4">
      {!isWelcome ? (
        <div className="mb-4 flex items-center gap-2">
          {Array.from({ length: progressSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition ${
                index < progressIndex ? "bg-[var(--az-accent)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="flex-1">{renderStep()}</div>

      <div className="sticky bottom-0 mt-5 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(50,61,80,0),rgba(50,61,80,0.96)_18%)] pb-2 pt-4 backdrop-blur">
        {isWelcome ? (
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
          >
            Let&apos;s get started
          </button>
        ) : isReview ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-[18px] border border-[var(--az-line)] bg-white/5 px-4 py-4 text-sm font-semibold text-[var(--az-text)] transition hover:bg-white/10"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze bill"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-[18px] border border-[var(--az-line)] bg-white/5 px-4 py-4 text-sm font-semibold text-[var(--az-text)] transition hover:bg-white/10"
            >
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              className="rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </form>
  );
}