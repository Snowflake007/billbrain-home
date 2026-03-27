"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult, BillInput } from "@/lib/types";
import { demoScenarios } from "@/lib/demoData";
import { useFormState } from "@/hooks/useFormState";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { useWeatherLookup } from "@/hooks/useWeatherLookup";
import { useBillExtraction } from "@/hooks/useBillExtraction";
import { STORAGE_KEY } from "@/lib/analyzerFormConstants";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { MethodStep } from "@/components/steps/MethodStep";
import { DemoStep } from "@/components/steps/DemoStep";
import { DetailsStep } from "@/components/steps/DetailsStep";
import { ContextStep } from "@/components/steps/ContextStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { ProgressBar } from "@/components/ProgressBar";
import { FormButtons } from "@/components/FormButtons";

type DemoId = keyof typeof demoScenarios;

export function AnalyzerForm() {
  const router = useRouter();
  const { form, setForm, update } = useFormState();
  const { currentStep, goNext, goBack, getProgressInfo } = useStepNavigation(form);
  const { weatherLoading, weatherError, setWeatherError, handleWeatherLookup } =
    useWeatherLookup(form, setForm);
  const { extracting, extractError, extractWarnings, setExtractError, setExtractWarnings, handleExtractFromUpload } =
    useBillExtraction(setForm);

  const [selectedDemo, setSelectedDemo] = useState<DemoId>("heatingSpike");
  const [loading, setLoading] = useState(false);
  const [uploadName, setUploadName] = useState(form.fileName || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const isWelcome = currentStep === "welcome";
  const isReview = currentStep === "review";
  const { progressSteps, progressIndex } = getProgressInfo();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: BillInput = {
        utilityType: form.utilityType,
        homeType: form.homeType,
        currentTotal: form.currentTotal,
        previousTotal: form.previousTotal,
        currentUsage: form.currentUsage,
        previousUsage: form.previousUsage,
        weatherDeltaPercent: form.weatherDeltaPercent,
        note: form.note,
        fileName: uploadName || form.fileName,
        locationQuery: form.locationQuery,
        weatherSummary: form.weatherSummary,
        extractedProvider: form.extractedProvider,
        extractedBillingPeriod: form.extractedBillingPeriod,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AnalysisResult;

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          result: data,
          form: payload,
        })
      );

      router.push("/analysis");
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    if (currentStep === "welcome") {
      return <WelcomeStep />;
    }

    if (currentStep === "method") {
      return <MethodStep form={form} onUpdate={update} />;
    }

    if (currentStep === "demo") {
      return (
        <DemoStep
          form={form}
          selectedDemo={selectedDemo}
          onSelectDemo={setSelectedDemo}
          onSetForm={setForm}
          onSetUploadName={setUploadName}
          onClearWeatherError={() => setWeatherError("")}
        />
      );
    }

    if (currentStep === "details") {
      return (
        <DetailsStep
          form={form}
          onUpdate={update}
          uploadName={uploadName}
          onSetUploadName={setUploadName}
          uploadedFile={uploadedFile}
          onSetUploadedFile={setUploadedFile}
          extracting={extracting}
          extractError={extractError}
          onSetExtractError={setExtractError}
          extractWarnings={extractWarnings}
          onSetExtractWarnings={setExtractWarnings}
          onExtract={handleExtractFromUpload}
          selectedDemo={selectedDemo}
        />
      );
    }

    if (currentStep === "context") {
      return (
        <ContextStep
          form={form}
          onUpdate={update}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onWeatherLookup={handleWeatherLookup}
          onClearWeatherError={() => setWeatherError("")}
        />
      );
    }

    // Review step
    return <ReviewStep form={form} uploadName={uploadName} selectedDemo={selectedDemo} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col px-4 pb-4 pt-4">
      {!isWelcome && <ProgressBar progressSteps={progressSteps} progressIndex={progressIndex} />}

      <div className="flex-1">{renderStep()}</div>

      <FormButtons
        isWelcome={isWelcome}
        isReview={isReview}
        loading={loading}
        onBack={goBack}
        onNext={goNext}
      />
    </form>
  );
}
