interface FormButtonsProps {
  isWelcome: boolean;
  isReview: boolean;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function FormButtons({
  isWelcome,
  isReview,
  loading,
  onBack,
  onNext,
}: FormButtonsProps) {
  return (
    <div className="sticky bottom-0 mt-5 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(50,61,80,0),rgba(50,61,80,0.96)_18%)] pb-2 pt-4 backdrop-blur">
      {isWelcome ? (
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
        >
          Let&apos;s get started
        </button>
      ) : isReview ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[18px] border border-[var(--az-line)] bg-white/5 px-4 py-4 text-sm font-semibold text-[var(--az-text)] transition hover:bg-white/10"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze bill"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[18px] border border-[var(--az-line)] bg-white/5 px-4 py-4 text-sm font-semibold text-[var(--az-text)] transition hover:bg-white/10"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] transition hover:brightness-105"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
