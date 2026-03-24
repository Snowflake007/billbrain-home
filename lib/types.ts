export type Severity = "Normal" | "Watch" | "Investigate" | "Urgent";

export type BillInput = {
  utilityType: "electricity" | "water" | "gas";
  homeType: "apartment" | "house" | "duplex";
  currentTotal: number;
  previousTotal: number;
  currentUsage: number;
  previousUsage: number;
  weatherDeltaPercent: number;
  note?: string;
  fileName?: string;
};

export type AnalysisResult = {
  summary: string;
  anomalyPercent: number;
  forecastNextMonth: number;
  forecastRange: [number, number];
  severity: Severity;
  likelyCauses: string[];
  actionPlan: string[];
  confidence: "Low" | "Medium" | "High";
  parsedBill: {
    provider: string;
    billingPeriod: string;
    total: number;
    usage: number;
  };
};
