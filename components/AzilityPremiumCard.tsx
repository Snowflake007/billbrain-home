import React from "react";

type AzilityPremiumCardProps = {
  compact?: boolean;
  className?: string;
};

export function AzilityPremiumCard({
  compact = false,
  className = "",
}: AzilityPremiumCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-[var(--az-line-strong)] bg-[linear-gradient(135deg,rgba(153,202,60,0.18),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.02))] ${className}`}
    >
      <div className="border-b border-[rgba(255,255,255,0.08)] px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/azility-icon.png"
            alt="Azility icon"
            className="h-11 w-11 object-contain"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
              Enterprise scale
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--az-text)]">
              Ready to scale up?
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <img
          src="/azility-wordmark.png"
          alt="Azility smarter energy management"
          className="mx-auto w-[85%] object-contain"
        />

        <p className="text-sm leading-6 text-[var(--az-text-soft)]">
          {compact
            ? "Have a business? Track buildings at enterprise scale with real-time provider connections and advanced anomaly detection."
            : "Have a business that needs these features at enterprise scale? Connect directly to Azility for continuous utility intelligence, multi-building management, and advanced analytics."}
        </p>

        <a
          href="https://www.azility.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-[18px] bg-[var(--az-accent)] px-4 py-4 text-sm font-bold text-[var(--az-button-text)] text-center transition hover:brightness-105"
        >
          Learn more about Azility
        </a>
      </div>
    </div>
  );
}