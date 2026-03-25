import { AnalyzerForm } from "@/components/AnalyzerForm";
import { PhoneShell } from "@/components/PhoneShell";

export default function HomePage() {
  return (
    <PhoneShell
      title="BillBrain Home"
      subtitle="A cleaner mobile flow for checking utility spikes, uploads, and connected billing data."
    >
      <AnalyzerForm />
    </PhoneShell>
  );
}