import { useState } from "react";
import type { BillExtractionResult } from "@/lib/types";
import type { FlowState } from "./useFormState";

export function useBillExtraction(
  setForm: (updater: (current: FlowState) => FlowState) => void
) {
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);

  const handleExtractFromUpload = async (uploadedFile: File | null) => {
    if (!uploadedFile) {
      setExtractError("Pick an image or PDF first.");
      return;
    }

    setExtracting(true);
    setExtractError("");
    setExtractWarnings([]);

    try {
      const body = new FormData();
      body.set("file", uploadedFile);

      const response = await fetch("/api/extract-bill", {
        method: "POST",
        body,
      });

      const data = (await response.json()) as
        | BillExtractionResult
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error || "Extraction failed." : "Extraction failed."
        );
      }

      if (!("utilityType" in data)) {
        throw new Error("Invalid extraction response.");
      }

      setExtractWarnings(data.warnings || []);

      setForm((current) => ({
        ...current,
        utilityType:
          data.utilityType !== "unknown" ? data.utilityType : current.utilityType,
        currentTotal: data.currentTotal ?? current.currentTotal,
        previousTotal: data.previousTotal ?? current.previousTotal,
        currentUsage: data.currentUsage ?? current.currentUsage,
        previousUsage: data.previousUsage ?? current.previousUsage,
        locationQuery: data.serviceAddressCity ?? current.locationQuery,
        extractedProvider: data.provider ?? current.extractedProvider,
        extractedBillingPeriod:
          data.billingPeriod ?? current.extractedBillingPeriod,
      }));
    } catch (error) {
      setExtractError(
        error instanceof Error ? error.message : "Could not read the uploaded bill."
      );
    } finally {
      setExtracting(false);
    }
  };

  return {
    extracting,
    extractError,
    extractWarnings,
    setExtractError,
    setExtractWarnings,
    handleExtractFromUpload,
  };
}
