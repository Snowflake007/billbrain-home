const scenarios = [
  { id: "heatingSpike", label: "Heating spike" },
  { id: "waterLeak", label: "Possible leak" },
  { id: "feeJump", label: "Fee jump" },
];

export function ScenarioButtons({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="az-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {scenarios.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item.id)}
          className="shrink-0 rounded-full border border-[var(--az-line)] bg-white/5 px-4 py-2 text-sm font-medium text-[var(--az-text)] transition hover:border-[var(--az-accent-border)] hover:bg-[var(--az-accent-soft)]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}