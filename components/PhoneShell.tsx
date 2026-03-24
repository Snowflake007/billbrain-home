import type { ReactNode } from "react";

type PhoneShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function PhoneShell({ title, subtitle, children }: PhoneShellProps) {
  return (
    <main className="min-h-screen px-3 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="overflow-hidden rounded-[34px] border border-[var(--az-line)] bg-[var(--az-bg)] shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
          <div className="flex items-center justify-between px-5 pb-2 pt-3 text-[11px] text-[var(--az-muted-2)]">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--az-accent)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--az-text-soft)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--az-muted-2)]" />
            </div>
          </div>

          <header className="border-b border-[var(--az-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-5 pb-4 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              BillBrain Home
            </p>

            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold leading-tight text-[var(--az-text)]">
                  {title}
                </h1>
                <p className="mt-1 text-sm leading-6 text-[var(--az-muted)]">
                  {subtitle}
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-xs font-medium text-[var(--az-text-soft)]">
                MVP
              </div>
            </div>
          </header>

          <div className="min-h-[calc(100dvh-72px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent)]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}