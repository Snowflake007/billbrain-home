import { AnalysisScreen } from "@/components/AnalysisScreen";
import { PhoneShell } from "@/components/PhoneShell";

export default function AnalysisPage() {
  return (
    <PhoneShell
      title="Bill analysis"
      subtitle="AI explanation, severity, likely causes, and next-step guidance."
    >
      <AnalysisScreen />
    </PhoneShell>
  );
}