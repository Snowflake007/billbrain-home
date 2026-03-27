import { useState } from "react";
import type { WeatherLookupResult } from "@/lib/types";
import type { FlowState } from "./useFormState";

export function useWeatherLookup(
  form: FlowState,
  setForm: (updater: (current: FlowState) => FlowState) => void
) {
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const handleWeatherLookup = async () => {
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
  };

  return {
    weatherLoading,
    weatherError,
    setWeatherError,
    handleWeatherLookup,
  };
}
