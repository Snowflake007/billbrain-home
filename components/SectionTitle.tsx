export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
    </div>
  );
}
