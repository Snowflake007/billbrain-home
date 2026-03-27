import type { FlowState } from "@/hooks/useFormState";
import { HOME_OPTIONS, UTILITY_OPTIONS, formatUtility, formatHome } from "@/lib/analyzerFormConstants";

interface ContextStepProps {
  form: FlowState;
  onUpdate: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
  weatherLoading: boolean;
  weatherError: string;
  onWeatherLookup: () => Promise<void>;
  onClearWeatherError: () => void;
}

export function ContextStep({
  form,
  onUpdate,
  weatherLoading,
  weatherError,
  onWeatherLookup,
  onClearWeatherError,
}: ContextStepProps) {
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

      {/* Utility type section */}
      <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--az-text)]">Utility type</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {UTILITY_OPTIONS.map((option) => {
            const selected = form.utilityType === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdate("utilityType", option)}
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

      {/* Home type section */}
      <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--az-text)]">Home type</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {HOME_OPTIONS.map((option) => {
            const selected = form.homeType === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdate("homeType", option)}
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

      {/* Weather context section */}
      <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--az-text)]">Weather context</p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-[var(--az-text)]">
            City or postal code
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
              type="text"
              value={form.locationQuery || ""}
              onChange={(event) => {
                onUpdate("locationQuery", event.target.value);
                onClearWeatherError();
              }}
              placeholder="Montreal"
            />
          </label>

          <button
            type="button"
            onClick={onWeatherLookup}
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

      {/* User context section */}
      <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
        <label className="text-sm font-medium text-[var(--az-text)]">
          User context
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
            value={form.note}
            onChange={(event) => onUpdate("note", event.target.value)}
            placeholder="Example: I used a space heater, had guests over, or left town for a week."
          />
        </label>
      </div>
    </section>
  );
}
