import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const extractionSchema = {
  type: "object",
  properties: {
    provider: {
      type: "string",
      description: "Utility provider name. Empty string if not visible.",
    },
    billingPeriod: {
      type: "string",
      description: "Billing period exactly as shown on the bill. Empty string if not visible.",
    },
    utilityType: {
      type: "string",
      enum: ["electricity", "water", "gas", "unknown"],
      description: "Detected utility type.",
    },
    currentTotal: {
      type: "string",
      description: "Current total amount due as numeric text only, like 241.90. Empty string if missing.",
    },
    previousTotal: {
      type: "string",
      description: "Previous bill total if clearly shown. Empty string if missing.",
    },
    currentUsage: {
      type: "string",
      description: "Current usage for the current billing period as numeric text only. Empty string if missing.",
    },
    previousUsage: {
      type: "string",
      description: "Previous usage if clearly shown. Empty string if missing.",
    },
    serviceAddressCity: {
      type: "string",
      description: "City only from the service address, if clearly visible. Empty string if missing.",
    },
    confidence: {
      type: "string",
      enum: ["Low", "Medium", "High"],
      description: "Confidence in the extraction.",
    },
    warnings: {
      type: "array",
      items: { type: "string" },
      description: "Short warnings about unreadable or ambiguous fields.",
    },
  },
  required: [
    "provider",
    "billingPeriod",
    "utilityType",
    "currentTotal",
    "previousTotal",
    "currentUsage",
    "previousUsage",
    "serviceAddressCity",
    "confidence",
    "warnings",
  ],
} as const;

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, and PDF are supported." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Inline is fine for normal phone photos / small PDFs.
    // If you start sending large PDFs, switch this route to Gemini Files API.
    if (bytes.byteLength > 18 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "File is too large for inline extraction. Use a smaller file or switch this route to Gemini Files API.",
        },
        { status: 413 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You extract structured information from a household utility bill.

Rules:
- Return JSON only.
- Never guess. Only extract values clearly shown on the bill.
- Use empty strings for missing fields.
- utilityType must be one of: electricity, water, gas, unknown.
- currentTotal: the amount due for THIS billing period.
- previousTotal: the total amount due from the PREVIOUS billing period (look for fields like "last month" or "previous bill"—NOT usage, NOT taxes, NOT fees).
- currentUsage and previousUsage must refer to usage amounts during their respective billing periods.
- serviceAddressCity should be city only, if clearly visible.
- If you cannot clearly identify previousTotal on the bill, leave it empty.
- If this does not look like a utility bill, set utilityType to "unknown" and explain why in warnings.
- Confidence should reflect readability and how explicit the bill is.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: bytes.toString("base64"),
          },
        },
        { text: prompt },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseJsonSchema: extractionSchema,
      },
    });

    const raw = JSON.parse(response.text || "{}");

    const result = {
      provider: toNullableString(raw.provider),
      billingPeriod: toNullableString(raw.billingPeriod),
      utilityType:
        raw.utilityType === "electricity" ||
        raw.utilityType === "water" ||
        raw.utilityType === "gas" ||
        raw.utilityType === "unknown"
          ? raw.utilityType
          : "unknown",
      currentTotal: toNullableNumber(raw.currentTotal),
      previousTotal: toNullableNumber(raw.previousTotal),
      currentUsage: toNullableNumber(raw.currentUsage),
      previousUsage: toNullableNumber(raw.previousUsage),
      serviceAddressCity: toNullableString(raw.serviceAddressCity),
      confidence:
        raw.confidence === "Low" ||
        raw.confidence === "Medium" ||
        raw.confidence === "High"
          ? raw.confidence
          : "Low",
      warnings: Array.isArray(raw.warnings)
        ? raw.warnings.filter((item: unknown): item is string => typeof item === "string")
        : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[extract-bill] failed:", error);

    return NextResponse.json(
      { error: "Failed to extract bill fields." },
      { status: 500 }
    );
  }
}