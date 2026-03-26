import { AnalyzerForm } from "@/components/AnalyzerForm";
import { PhoneShell } from "@/components/PhoneShell";

export default function HomePage() {
  return (
    <PhoneShell
      title="Start your journey"
    >
      <AnalyzerForm />
    </PhoneShell>
  );
}