export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0891b2]">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-[#64748b] sm:text-base">{subtitle}</p>
    </div>
  );
}
