import { AnalysisScreen } from "@/components/AnalysisScreen";
import { PhoneShell } from "@/components/PhoneShell";

export default function AnalysisPage() {
  return (
    <PhoneShell
      title="Bill Analysis"
    >
      <AnalysisScreen />
    </PhoneShell>
  );
}