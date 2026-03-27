import { useState } from "react";
import type { BillInput } from "@/lib/types";

export type FlowState = BillInput & {
  inputMethod: "manual" | "image" | "connect" | "demo";
  providerName: string;
  accountLabel: string;
};

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

export function useFormState() {
  const [form, setForm] = useState<FlowState>(defaultState);

  const update = <K extends keyof FlowState>(key: K, value: FlowState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return { form, setForm, update };
}
