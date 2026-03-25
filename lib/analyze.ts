import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, BillInput, Severity } from "@/lib/types";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeInsight(text: string) {
  return text
    .toLowerCase()
    .replace(/weather context:/g, " ")
    .replace(/user context note:/g, " ")
    .replace(/your note mentions/g, " ")
    .replace(/recent weather was/g, " ")
    .replace(/notably/g, " ")
    .replace(/which likely/g, " ")
    .replace(/which/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(
      /\b(the|a|an|this|that|is|was|are|and|or|to|of|for|with|than|it|as|on|in|by|more|most)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function similarityScore(a: string, b: string) {
  const aSet = new Set(a.split(" ").filter(Boolean));
  const bSet = new Set(b.split(" ").filter(Boolean));

  if (!aSet.size || !bSet.size) return 0;

  let overlap = 0;
  for (const token of aSet) {
    if (bSet.has(token)) overlap++;
  }

  return overlap / Math.max(aSet.size, bSet.size);
}

function dedupeInsights(items: string[], max = 4) {
  const kept: string[] = [];
  const normalizedKept: string[] = [];

  for (const item of items) {
    const normalized = normalizeInsight(item);
    if (!normalized) continue;

    const tooSimilar = normalizedKept.some((existing) => {
      return (
        existing.includes(normalized) ||
        normalized.includes(existing) ||
        similarityScore(existing, normalized) >= 0.6
      );
    });

    if (!tooSimilar) {
      kept.push(item);
      normalizedKept.push(normalized);
    }

    if (kept.length >= max) break;
  }

  return kept;
}

type DiagnosticSignals = {
  changePercent: number;
  usagePercent: number;
  costPerUnitDeltaPercent: number;
  weatherDeltaPercent: number;
  weatherDirection: "colder" | "milder" | "stable";
  usageDirection: "up" | "down" | "flat";
  billingPattern: "usage-driven" | "fee-driven" | "mixed" | "extreme";
  patternHints: string[];
};

function extractSignals(input: BillInput): DiagnosticSignals {
  const changePercent =
    ((input.currentTotal - input.previousTotal) / Math.max(input.previousTotal, 1)) * 100;

  const usagePercent =
    ((input.currentUsage - input.previousUsage) / Math.max(input.previousUsage, 1)) * 100;

  const currentUnitCost = input.currentTotal / Math.max(input.currentUsage, 1);
  const previousUnitCost = input.previousTotal / Math.max(input.previousUsage, 1);

  const costPerUnitDeltaPercent =
    ((currentUnitCost - previousUnitCost) / Math.max(previousUnitCost, 0.0001)) * 100;

  const weatherDirection =
    input.weatherDeltaPercent <= -6
      ? "colder"
      : input.weatherDeltaPercent >= 6
        ? "milder"
        : "stable";

  const usageDirection =
    usagePercent >= 5 ? "up" : usagePercent <= -5 ? "down" : "flat";

  let billingPattern: DiagnosticSignals["billingPattern"] = "mixed";

  if (Math.abs(changePercent) >= 45 || Math.abs(usagePercent) >= 60) {
    billingPattern = "extreme";
  } else if (Math.abs(usagePercent) >= Math.abs(costPerUnitDeltaPercent) + 8) {
    billingPattern = "usage-driven";
  } else if (Math.abs(costPerUnitDeltaPercent) >= Math.abs(usagePercent) + 8) {
    billingPattern = "fee-driven";
  }

  const patternHints: string[] = [];

  if (input.utilityType === "electricity" && weatherDirection === "colder" && usagePercent > 10) {
    patternHints.push("Colder weather plus higher electricity usage suggests heating demand.");
  }

  if (input.utilityType === "water" && usagePercent >= 50) {
    patternHints.push("Large water usage jump may indicate leak-like or constant-draw behavior.");
  }

  if (
    input.utilityType === "gas" &&
    Math.abs(usagePercent) <= 5 &&
    costPerUnitDeltaPercent >= 8
  ) {
    patternHints.push("Gas bill rose without much usage change, pointing toward fees or rate changes.");
  }

  if ((input.note || "").trim()) {
    patternHints.push(`User context note: ${input.note?.trim()}`);
  }

  if (input.weatherSummary) {
    patternHints.push(`Weather context: ${input.weatherSummary}`);
  }

  return {
    changePercent: round(changePercent),
    usagePercent: round(usagePercent),
    costPerUnitDeltaPercent: round(costPerUnitDeltaPercent),
    weatherDeltaPercent: round(input.weatherDeltaPercent),
    weatherDirection,
    usageDirection,
    billingPattern,
    patternHints,
  };
}

function getSeverity(
  changePercent: number,
  usagePercent: number,
  utilityType: BillInput["utilityType"]
): Severity {
  if (utilityType === "water" && usagePercent >= 60) return "Urgent";
  if (changePercent >= 30 || usagePercent >= 30) return "Investigate";
  if (changePercent >= 12 || usagePercent >= 12) return "Watch";
  return "Normal";
}

function buildLikelyCauses(
  input: BillInput,
  changePercent: number,
  usagePercent: number
): string[] {
  const causes: string[] = [];

  if (input.utilityType === "electricity") {
    if (input.weatherDeltaPercent <= -8) {
      causes.push("Recent weather was colder than the prior comparison window, which likely increased heating demand.");
    }
    if ((input.note || "").toLowerCase().includes("heater")) {
      causes.push("Your note mentions extra electric heating, which matches the usage jump.");
    }
    if (usagePercent > changePercent + 6) {
      causes.push("The spike looks usage-driven more than fee-driven.");
    }
  }

  if (input.utilityType === "water") {
    if (usagePercent >= 60) {
      causes.push("The sustained water jump is large enough to suggest a leak or constant draw issue.");
    }
    if ((input.note || "").toLowerCase().includes("no change")) {
      causes.push("Stable occupancy with higher water use makes the spike harder to explain as normal behavior.");
    }
    if (Math.abs(input.weatherDeltaPercent) <= 4) {
      causes.push("Weather does not explain the increase, so equipment or plumbing issues move higher on the list.");
    }
  }

  if (input.utilityType === "gas") {
    if (Math.abs(usagePercent) <= 4 && changePercent >= 8) {
      causes.push("Charges rose even though usage stayed nearly flat, which points to a fee or rate change.");
    }
    if (input.weatherDeltaPercent <= -8) {
      causes.push("Cooler weather may have contributed, but it does not explain the whole increase.");
    }
  }

  const alreadyHasWeatherCause = causes.some((cause) => {
    const normalized = normalizeInsight(cause);
    return (
      normalized.includes("weather") ||
      normalized.includes("heating demand") ||
      normalized.includes("colder") ||
      normalized.includes("milder")
    );
  });

  if (input.weatherSummary && !alreadyHasWeatherCause) {
    causes.push(input.weatherSummary);
  }

  if (!causes.length) {
    causes.push("The increase appears moderate and may reflect a normal seasonal shift.");
  }

  if (changePercent >= 20 && usagePercent >= 20) {
    causes.push("Both cost and usage moved together, which reduces the chance that this is only a billing-display issue.");
  }

  return dedupeInsights(causes, 4);
}

function buildActionPlan(input: BillInput, severity: Severity): string[] {
  const actions: string[] = [];

  if (input.utilityType === "electricity") {
    actions.push("Check thermostat schedules and any space heaters used this billing period.");
    actions.push("Compare overnight usage or off-hours device activity if you have smart meter access.");
  }

  if (input.utilityType === "water") {
    actions.push("Do an overnight leak test: record the meter before bed and compare it in the morning.");
    actions.push("Inspect toilets, irrigation, and the water heater pressure relief line for silent leaks.");
  }

  if (input.utilityType === "gas") {
    actions.push("Compare the fee breakdown with the previous bill to spot supplier, delivery, or service-charge changes.");
    actions.push("Check whether heating settings or appliance runtime changed during colder days.");
  }

  if (severity === "Normal") {
    actions.push("Monitor one more cycle before taking action.");
  } else if (severity === "Watch") {
    actions.push("Track the next bill and collect one more month of context before replacing equipment.");
  } else if (severity === "Investigate") {
    actions.push("Investigate now. This is not a tiny fluctuation.");
  } else {
    actions.push("Treat this as urgent and rule out a leak or equipment fault first.");
  }

  return actions.slice(0, 4);
}

function buildSummary(
  input: BillInput,
  changePercent: number,
  severity: Severity,
  causes: string[]
): string {
  const utilityName = input.utilityType[0].toUpperCase() + input.utilityType.slice(1);
  return `${utilityName} costs changed by ${round(changePercent)}% vs the previous bill. Severity: ${severity}. Most likely driver: ${causes[0]}`;
}

function buildVerdict(
  input: BillInput,
  severity: Severity,
  changePercent: number,
  usagePercent: number
) {
  if (input.utilityType === "electricity" && input.weatherDeltaPercent <= -8 && usagePercent > 15) {
    return "This looks like a weather-driven electricity spike, likely amplified by heating behavior.";
  }

  if (input.utilityType === "water" && usagePercent >= 60) {
    return "This water pattern is hard to explain as normal household behavior and may indicate a leak or constant draw issue.";
  }

  if (input.utilityType === "gas" && Math.abs(usagePercent) <= 4 && changePercent >= 8) {
    return "Charges increased without much usage change, so fees or rate changes are more likely than overconsumption.";
  }

  if (severity === "Urgent") {
    return "This bill change looks serious enough to investigate immediately.";
  }

  if (severity === "Investigate") {
    return "This bill change looks unusually high for the available context.";
  }

  if (severity === "Watch") {
    return "This bill is somewhat unusual, but not yet clearly abnormal.";
  }

  return "This bill looks broadly consistent with a normal cycle shift.";
}

function buildEnterpriseBridge(input: BillInput) {
  if (input.utilityType === "water") {
    return "At enterprise scale, Azility could use the same logic to flag abnormal water costs across buildings and surface likely leak events faster.";
  }

  if (input.utilityType === "gas") {
    return "At enterprise scale, Azility could use the same pattern to separate true consumption issues from rate or fee anomalies across many sites.";
  }

  return "At enterprise scale, Azility could apply this same workflow across buildings, campuses, and portfolios to detect utility anomalies earlier and guide faster action.";
}

const geminiResponseSchema = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      description: "One sharp sentence stating what this bill pattern most likely means."
    },
    summary: {
      type: "string",
      description: "A short grounded analysis summary using only the provided bill, weather, and note signals."
    },
    severity: {
      type: "string",
      enum: ["Normal", "Watch", "Investigate", "Urgent"],
      description: "Diagnosis severity based on the available structured evidence."
    },
    likelyCauses: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
      description: "Ranked likely causes from most likely to less likely."
    },
    actionPlan: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
      description: "Practical next steps for the user."
    },
    confidence: {
      type: "string",
      enum: ["Low", "Medium", "High"],
      description: "Confidence based on the quality of the structured evidence."
    },
    enterpriseBridge: {
      type: "string",
      description: "One sentence explaining how this same logic maps to Azility at enterprise scale."
    }
  },
  required: [
    "verdict",
    "summary",
    "severity",
    "likelyCauses",
    "actionPlan",
    "confidence",
    "enterpriseBridge"
  ]
};

async function callGemini(
  input: BillInput,
  signals: DiagnosticSignals,
  fallback: AnalysisResult
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("[Gemini] callGemini entered");
  console.log("[Gemini] API key present:", Boolean(apiKey));
  console.log("[Gemini] Model:", process.env.GEMINI_MODEL || "gemini-2.5-flash");

  if (!apiKey) {
    console.log("[Gemini] Missing GEMINI_API_KEY, using fallback.");
    return fallback;
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the primary diagnostic analyst for a utility anomaly app.

Your job:
- Diagnose the bill pattern from the structured input and diagnostic signals.
- Do NOT just restate the numbers.
- Do NOT invent hidden data, appliances, providers, or meter readings.
- Use the user's note only as supporting context, not proof.
- Give the most likely explanation first.
- Be concise, grounded, and product-grade.

Severity rubric:
- Normal = looks broadly consistent with normal variation
- Watch = somewhat unusual, but not clearly a fault yet
- Investigate = abnormal enough to check now
- Urgent = strong sign of leak/fault/extreme unexplained anomaly

Structured bill input:
${JSON.stringify(input, null, 2)}

Diagnostic signals:
${JSON.stringify(signals, null, 2)}

Important:
- You are the PRIMARY analyst.
- The fallback exists only if the model call fails and should not be used for your reasoning.
- The enterpriseBridge must connect this same household workflow to Azility at enterprise scale.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseJsonSchema: geminiResponseSchema
      }
    });

    const raw = response.text;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    console.log("[Gemini] Success: structured response received");
    return {
      ...fallback,
      verdict: typeof parsed.verdict === "string" ? parsed.verdict : fallback.verdict,
      summary: typeof parsed.summary === "string" ? parsed.summary : fallback.summary,
      severity:
        parsed.severity === "Normal" ||
        parsed.severity === "Watch" ||
        parsed.severity === "Investigate" ||
        parsed.severity === "Urgent"
          ? parsed.severity
          : fallback.severity,
      likelyCauses: Array.isArray(parsed.likelyCauses)
        ? dedupeInsights(parsed.likelyCauses, 4)
        : fallback.likelyCauses,
      actionPlan: Array.isArray(parsed.actionPlan)
        ? dedupeInsights(parsed.actionPlan, 4)
        : fallback.actionPlan,
      confidence:
        parsed.confidence === "Low" ||
        parsed.confidence === "Medium" ||
        parsed.confidence === "High"
          ? parsed.confidence
          : fallback.confidence,
      enterpriseBridge:
        typeof parsed.enterpriseBridge === "string"
          ? parsed.enterpriseBridge
          : fallback.enterpriseBridge
    };
  } catch (error) {
    console.error("[Gemini] Analysis failed:", error);
    return fallback;
  }
}

export function heuristicAnalysis(input: BillInput): AnalysisResult {
  const changePercent =
    ((input.currentTotal - input.previousTotal) / Math.max(input.previousTotal, 1)) * 100;
  const usagePercent =
    ((input.currentUsage - input.previousUsage) / Math.max(input.previousUsage, 1)) * 100;

  const severity = getSeverity(changePercent, usagePercent, input.utilityType);
    const likelyCauses = buildLikelyCauses(input, changePercent, usagePercent);
  const actionPlan = buildActionPlan(input, severity);
  const verdict = buildVerdict(input, severity, changePercent, usagePercent);
  const enterpriseBridge = buildEnterpriseBridge(input);

  const blendedChange = changePercent * 0.65 + usagePercent * 0.35;
  const forecastNextMonth = round(input.currentTotal * (1 + (blendedChange / 100) * 0.2));
  const forecastRange: [number, number] = [
    round(forecastNextMonth * 0.92),
    round(forecastNextMonth * 1.08),
  ];
  const confidence =
    severity === "Normal" ? "Low" : severity === "Watch" ? "Medium" : "High";

    return {
    verdict,
    summary: buildSummary(input, changePercent, severity, likelyCauses),
    anomalyPercent: round(changePercent),
    forecastNextMonth,
    forecastRange,
    severity,
    likelyCauses,
    actionPlan,
        confidence,
    enterpriseBridge,
    parsedBill: {
      provider:
        input.utilityType === "electricity"
          ? "Hydro Demo"
          : input.utilityType === "water"
            ? "City Water Demo"
            : "Gas Demo Co.",
      billingPeriod: "Prototype demo cycle",
      total: input.currentTotal,
      usage: input.currentUsage,
    },
  };
}

export async function analyzeBill(input: BillInput): Promise<AnalysisResult> {
  const fallback = heuristicAnalysis(input);
  const signals = extractSignals(input);
  const provider = process.env.AI_PROVIDER || "gemini";

  console.log("[AI] analyzeBill called");
  console.log("[AI] Provider:", provider);
  console.log("[AI] GEMINI_API_KEY present:", Boolean(process.env.GEMINI_API_KEY));

  if (provider === "gemini") {
    console.log("[AI] Routing to Gemini");
    return callGemini(input, signals, fallback);
  }

  console.log("[AI] Provider is not gemini, using fallback.");
  return fallback;
}