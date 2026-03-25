"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult, BillInput } from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";

type StoredAnalysis = {
  result: AnalysisResult;
  form: BillInput;
};

const STORAGE_KEY = "billbrain:lastAnalysis";

export function AnalysisScreen() {
  const router = useRouter();
  const [payload, setPayload] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredAnalysis;
      setPayload(parsed);
    } catch {
      setPayload(null);
    }
  }, []);

  if (!payload) {
    return (
      <div className="px-4 pb-6 pt-4">
        <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-5">
          <p className="text-sm leading-6 text-[var(--az-muted)]">
            No saved analysis found. Go back and run a scenario first.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
          >
            Back to main screen
          </button>
        </div>
      </div>
    );
  }

  const { result, form } = payload;

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="space-y-4">
        <section className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
            Analysis context
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Utility
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                {form.utilityType}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Home
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                {form.homeType}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Current total
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                ${form.currentTotal}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Previous total
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--az-text)]">
                ${form.previousTotal}
              </p>
            </div>
          </div>

          {form.weatherSummary ? (
            <div className="mt-4 rounded-2xl border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
                Weather context
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--az-text)]">
                {form.weatherSummary}
              </p>
            </div>
          ) : null}
        </section>

        <ResultCard result={result} />

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            router.push("/");
          }}
          className="w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
        >
          Analyze another bill
        </button>
      </div>
    </div>
  );
}