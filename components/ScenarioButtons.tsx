const scenarios = [
  { id: "heatingSpike", label: "Heating spike" },
  { id: "waterLeak", label: "Possible leak" },
  { id: "feeJump", label: "Fee jump" },
];

export function ScenarioButtons({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {scenarios.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item.id)}
          className="shrink-0 rounded-full border border-[#334155] bg-white/5 px-4 py-2 text-sm font-medium text-[#cbd5e1] transition hover:border-[#0891b2]/50 hover:bg-[#0891b2]/10 hover:text-[#06b6d4]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}