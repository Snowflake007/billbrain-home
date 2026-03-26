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
  locationQuery?: string;
  weatherSummary?: string;
  extractedProvider?: string;
  extractedBillingPeriod?: string;
};

export type BillExtractionResult = {
  provider: string | null;
  billingPeriod: string | null;
  utilityType: BillInput["utilityType"] | "unknown";
  currentTotal: number | null;
  previousTotal: number | null;
  currentUsage: number | null;
  previousUsage: number | null;
  serviceAddressCity: string | null;
  confidence: "Low" | "Medium" | "High";
  warnings: string[];
};

export type AnalysisResult = {
  verdict: string;
  summary: string;
  anomalyPercent: number;
  forecastNextMonth: number;
  forecastRange: [number, number];
  severity: Severity;
  likelyCauses: string[];
  actionPlan: string[];
  confidence: "Low" | "Medium" | "High";
  enterpriseBridge: string;
  parsedBill: {
    provider: string;
    billingPeriod: string;
    total: number;
    usage: number;
  };
};

export type WeatherLookupResult = {
  resolvedName: string;
  latitude: number;
  longitude: number;
  currentWindowAvgC: number;
  previousWindowAvgC: number;
  deltaPercent: number;
  summary: string;
};