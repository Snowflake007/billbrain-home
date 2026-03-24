import type { AnalysisResult, BillInput, Severity } from "@/lib/types";

function round(value: number) {
  return Math.round(value * 100) / 100;
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

  if (input.weatherSummary) {
    causes.push(input.weatherSummary);
  }

  if (!causes.length) {
    causes.push("The increase appears moderate and may reflect a normal seasonal shift.");
  }

  if (changePercent >= 20 && usagePercent >= 20) {
    causes.push("Both cost and usage moved together, which reduces the chance that this is only a billing-display issue.");
  }

  return causes.slice(0, 4);
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

export function heuristicAnalysis(input: BillInput): AnalysisResult {
  const changePercent =
    ((input.currentTotal - input.previousTotal) / Math.max(input.previousTotal, 1)) * 100;
  const usagePercent =
    ((input.currentUsage - input.previousUsage) / Math.max(input.previousUsage, 1)) * 100;

  const severity = getSeverity(changePercent, usagePercent, input.utilityType);
  const likelyCauses = buildLikelyCauses(input, changePercent, usagePercent);
  const actionPlan = buildActionPlan(input, severity);

  const blendedChange = changePercent * 0.65 + usagePercent * 0.35;
  const forecastNextMonth = round(input.currentTotal * (1 + (blendedChange / 100) * 0.2));
  const forecastRange: [number, number] = [
    round(forecastNextMonth * 0.92),
    round(forecastNextMonth * 1.08),
  ];
  const confidence =
    severity === "Normal" ? "Low" : severity === "Watch" ? "Medium" : "High";

  return {
    summary: buildSummary(input, changePercent, severity, likelyCauses),
    anomalyPercent: round(changePercent),
    forecastNextMonth,
    forecastRange,
    severity,
    likelyCauses,
    actionPlan,
    confidence,
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
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) return fallback;

  try {
    const prompt = `You are a utility bill anomaly analyst. Return strict JSON with keys summary, likelyCauses, actionPlan, confidence. Keep it short and practical. Input: ${JSON.stringify(
      input
    )}. Heuristic baseline: ${JSON.stringify(fallback)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You return strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) return fallback;
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    return {
      ...fallback,
      summary: typeof parsed.summary === "string" ? parsed.summary : fallback.summary,
      likelyCauses: Array.isArray(parsed.likelyCauses)
        ? parsed.likelyCauses.slice(0, 4)
        : fallback.likelyCauses,
      actionPlan: Array.isArray(parsed.actionPlan)
        ? parsed.actionPlan.slice(0, 4)
        : fallback.actionPlan,
      confidence:
        parsed.confidence === "Low" ||
        parsed.confidence === "Medium" ||
        parsed.confidence === "High"
          ? parsed.confidence
          : fallback.confidence,
    };
  } catch {
    return fallback;
  }
}