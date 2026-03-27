import { useMemo } from "react";
import { AzilityPremiumCard } from "@/components/AzilityPremiumCard";
import type { FlowState } from "@/hooks/useFormState";
import { DEMO_CARDS, formatUtility, formatHome } from "@/lib/analyzerFormConstants";
import { demoScenarios } from "@/lib/demoData";

interface ReviewStepProps {
  form: FlowState;
  uploadName: string;
  selectedDemo: keyof typeof demoScenarios;
}

export function ReviewStep({ form, uploadName, selectedDemo }: ReviewStepProps) {
  const deltaPreview = useMemo(() => {
    const percent =
      ((form.currentTotal - form.previousTotal) / Math.max(form.previousTotal, 1)) * 100;
    const rounded = Math.round(percent * 10) / 10;
    const direction = rounded >= 0 ? "up" : "down";
    return `${Math.abs(rounded)}% ${direction} vs previous bill`;
  }, [form.currentTotal, form.previousTotal]);

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
                ? `Loaded demo: ${DEMO_CARDS.find((card) => card.id === selectedDemo)?.title}`
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
