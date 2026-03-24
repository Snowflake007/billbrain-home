"use client";

const labels = [
  { id: "heatingSpike", label: "Demo: winter heating spike" },
  { id: "waterLeak", label: "Demo: possible water leak" },
  { id: "feeJump", label: "Demo: fee jump" },
] as const;

export function ScenarioButtons({ onPick }: { onPick: (scenarioId: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {labels.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item.id)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-accent hover:text-accent"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
