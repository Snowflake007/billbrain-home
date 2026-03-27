import { useState } from "react";
import type { FlowState } from "./useFormState";

export type StepKey = "welcome" | "method" | "demo" | "details" | "context" | "review";

const STEPS: StepKey[] = ["welcome", "method", "demo", "details", "context", "review"];

export function useStepNavigation(form: FlowState) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex];

  const goNext = () => {
    if (currentStep === "welcome") {
      setStepIndex(STEPS.indexOf("method"));
      return;
    }

    if (currentStep === "method") {
      if (form.inputMethod === "demo") {
        setStepIndex(STEPS.indexOf("demo"));
      } else {
        setStepIndex(STEPS.indexOf("details"));
      }
      return;
    }

    if (currentStep === "demo") {
      setStepIndex(STEPS.indexOf("details"));
      return;
    }

    if (currentStep === "details") {
      setStepIndex(STEPS.indexOf("context"));
      return;
    }

    if (currentStep === "context") {
      setStepIndex(STEPS.indexOf("review"));
    }
  };

  const goBack = () => {
    if (currentStep === "method") {
      setStepIndex(STEPS.indexOf("welcome"));
      return;
    }

    if (currentStep === "demo") {
      setStepIndex(STEPS.indexOf("method"));
      return;
    }

    if (currentStep === "details") {
      if (form.inputMethod === "demo") {
        setStepIndex(STEPS.indexOf("demo"));
      } else {
        setStepIndex(STEPS.indexOf("method"));
      }
      return;
    }

    if (currentStep === "context") {
      setStepIndex(STEPS.indexOf("details"));
      return;
    }

    if (currentStep === "review") {
      setStepIndex(STEPS.indexOf("context"));
    }
  };

  const getProgressInfo = () => {
    const progressSteps = form.inputMethod === "demo" ? 5 : 4;

    let progressIndex = 0;
    if (currentStep === "method") progressIndex = 1;
    if (currentStep === "demo") progressIndex = 2;
    if (currentStep === "details") progressIndex = form.inputMethod === "demo" ? 3 : 2;
    if (currentStep === "context") progressIndex = form.inputMethod === "demo" ? 4 : 3;
    if (currentStep === "review") progressIndex = form.inputMethod === "demo" ? 5 : 4;

    return { progressSteps, progressIndex };
  };

  return {
    currentStep,
    stepIndex,
    goNext,
    goBack,
    getProgressInfo,
  };
}
