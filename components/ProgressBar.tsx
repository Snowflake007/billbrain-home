interface ProgressBarProps {
  progressSteps: number;
  progressIndex: number;
}

export function ProgressBar({ progressSteps, progressIndex }: ProgressBarProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Array.from({ length: progressSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 flex-1 rounded-full transition ${
            index < progressIndex ? "bg-[var(--az-accent)]" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
