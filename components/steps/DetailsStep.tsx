import type { FlowState } from "@/hooks/useFormState";
import { HOME_OPTIONS, PROVIDER_OPTIONS, UTILITY_OPTIONS, formatUtility, formatHome, DEMO_CARDS } from "@/lib/analyzerFormConstants";
import { demoScenarios } from "@/lib/demoData";

interface DetailsStepProps {
  form: FlowState;
  onUpdate: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
  uploadName: string;
  onSetUploadName: (name: string) => void;
  uploadedFile: File | null;
  onSetUploadedFile: (file: File | null) => void;
  extracting: boolean;
  extractError: string;
  onSetExtractError: (error: string) => void;
  extractWarnings: string[];
  onSetExtractWarnings: (warnings: string[]) => void;
  onExtract: (file: File | null) => Promise<void>;
  selectedDemo: keyof typeof demoScenarios;
}

export function DetailsStep({
  form,
  onUpdate,
  uploadName,
  onSetUploadName,
  uploadedFile,
  onSetUploadedFile,
  extracting,
  extractError,
  onSetExtractError,
  extractWarnings,
  onSetExtractWarnings,
  onExtract,
  selectedDemo,
}: DetailsStepProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--az-accent)]">
          {form.inputMethod === "demo" ? "Step 3" : "Step 2"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--az-text)]">
          Add the bill source
        </h2>
      </div>

      {/* Image upload section */}
      {form.inputMethod === "image" && (
        <ImageUploadSection
          uploadName={uploadName}
          uploadedFile={uploadedFile}
          extracting={extracting}
          extractError={extractError}
          extractWarnings={extractWarnings}
          form={form}
          onSetUploadedFile={onSetUploadedFile}
          onSetUploadName={onSetUploadName}
          onSetExtractError={onSetExtractError}
          onSetExtractWarnings={onSetExtractWarnings}
          onExtract={onExtract}
        />
      )}

      {/* Connect section */}
      {form.inputMethod === "connect" && (
        <ConnectSection form={form} onUpdate={onUpdate} />
      )}

      {/* Demo loaded section */}
      {form.inputMethod === "demo" && (
        <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--az-text)]">Loaded demo</p>
          <p className="mt-2 text-sm leading-6 text-[var(--az-muted)]">
            {DEMO_CARDS.find((card) => card.id === selectedDemo)?.title} is loaded. You can still tweak the numbers below.
          </p>
        </div>
      )}

      {/* Bill snapshot section */}
      <BillSnapshotSection form={form} onUpdate={onUpdate} />
    </section>
  );
}

interface ImageUploadSectionProps {
  uploadName: string;
  uploadedFile: File | null;
  extracting: boolean;
  extractError: string;
  extractWarnings: string[];
  form: FlowState;
  onSetUploadedFile: (file: File | null) => void;
  onSetUploadName: (name: string) => void;
  onSetExtractError: (error: string) => void;
  onSetExtractWarnings: (warnings: string[]) => void;
  onExtract: (file: File | null) => Promise<void>;
}

function ImageUploadSection({
  uploadName,
  uploadedFile,
  extracting,
  extractError,
  extractWarnings,
  form,
  onSetUploadedFile,
  onSetUploadName,
  onSetExtractError,
  onSetExtractWarnings,
  onExtract,
}: ImageUploadSectionProps) {
  return (
    <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--az-text)]">Upload bill or screenshot</p>
          <p className="mt-1 text-xs leading-5 text-[var(--az-muted-2)]">
            Use PDF, photo, or invoice image.
          </p>
        </div>

        <div className="rounded-full border border-[var(--az-line)] bg-white/5 px-3 py-1 text-xs text-[var(--az-text-soft)]">
          {uploadName || "No file"}
        </div>
      </div>

      <input
        className="mt-4 block w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-sm text-[var(--az-text)]"
        type="file"
        accept=".pdf,image/*"
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onSetUploadedFile(file);
          onSetUploadName(file?.name || "demo_bill.pdf");
          onSetExtractError("");
          onSetExtractWarnings([]);
        }}
      />
      <button
        type="button"
        onClick={() => onExtract(uploadedFile)}
        disabled={!uploadedFile || extracting}
        className="mt-3 w-full rounded-[18px] border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--az-text)] transition hover:bg-[var(--az-accent-soft-2)] disabled:opacity-60"
      >
        {extracting ? "Reading bill with AI..." : "Read bill with AI"}
      </button>

      {extractError ? (
        <p className="mt-3 text-sm text-[#ffe1e1]">{extractError}</p>
      ) : null}

      {form.currentUsage || form.currentTotal ? (
        <div className="mt-3 rounded-2xl border border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--az-text)]">
            📊 Extracted data
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {form.currentTotal ? (
              <div>
                <p className="text-xs text-[var(--az-muted)]">Current Total</p>
                <p className="mt-1 font-semibold text-[var(--az-text)]">${form.currentTotal}</p>
              </div>
            ) : null}
            {form.previousTotal ? (
              <div>
                <p className="text-xs text-[var(--az-muted)]">Previous Total</p>
                <p className="mt-1 font-semibold text-[var(--az-text)]">${form.previousTotal}</p>
              </div>
            ) : null}
            {form.currentUsage ? (
              <div>
                <p className="text-xs text-[var(--az-muted)]">Current Usage</p>
                <p className="mt-1 font-semibold text-[var(--az-text)]">
                  {form.currentUsage} {form.utilityType === "water" ? "gal" : form.utilityType === "electricity" ? "kWh" : "m³"}
                </p>
              </div>
            ) : null}
            {form.previousUsage ? (
              <div>
                <p className="text-xs text-[var(--az-muted)]">Previous Usage</p>
                <p className="mt-1 font-semibold text-[var(--az-text)]">
                  {form.previousUsage} {form.utilityType === "water" ? "gal" : form.utilityType === "electricity" ? "kWh" : "m³"}
                </p>
              </div>
            ) : null}
          </div>
          {form.extractedProvider || form.locationQuery ? (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)] text-xs text-[var(--az-muted)]">
              {form.extractedProvider && <p>Provider: {form.extractedProvider}</p>}
              {form.locationQuery && <p>Location: {form.locationQuery}</p>}
            </div>
          ) : null}
        </div>
      ) : null}

      {extractWarnings.length ? (
        <div className="mt-3 rounded-2xl border border-[var(--az-line)] bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--az-muted-2)]">
            ⚠️ Extraction notes
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--az-muted)]">
            {extractWarnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

interface ConnectSectionProps {
  form: FlowState;
  onUpdate: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}

function ConnectSection({ form, onUpdate }: ConnectSectionProps) {
  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--az-text)]">Connected billing source</p>
        <p className="mt-1 text-xs leading-5 text-[var(--az-muted-2)]">
          Connect to your utility provider or MCP for real-time data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROVIDER_OPTIONS.map((provider) => {
          const selected = form.providerName === provider;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => onUpdate("providerName", provider)}
              className={`rounded-[20px] border px-4 py-4 text-left text-sm font-semibold transition ${
                selected
                  ? "border-[var(--az-accent-border)] bg-[var(--az-accent-soft)] text-[var(--az-text)]"
                  : "border-[var(--az-line)] bg-white/5 text-[var(--az-text-soft)] hover:bg-white/10"
              }`}
            >
              {provider}
            </button>
          );
        })}
      </div>

      <label className="block text-sm font-medium text-[var(--az-text)]">
        Account or MCP identifier
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)] placeholder:text-[var(--az-muted-2)]"
          type="text"
          value={form.accountLabel}
          onChange={(event) => onUpdate("accountLabel", event.target.value)}
          placeholder="building-204 / home@example.com"
        />
      </label>
    </div>
  );
}

interface BillSnapshotSectionProps {
  form: FlowState;
  onUpdate: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}

function BillSnapshotSection({ form, onUpdate }: BillSnapshotSectionProps) {
  return (
    <div className="rounded-[28px] border border-[var(--az-line)] bg-[var(--az-surface)] p-4">
      <p className="text-sm font-semibold text-[var(--az-text)]">Bill snapshot</p>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-[var(--az-text)]">
            Current total ($)
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
              type="number"
              step="0.01"
              value={form.currentTotal}
              onChange={(event) => onUpdate("currentTotal", Number(event.target.value))}
            />
          </label>

          <label className="text-sm font-medium text-[var(--az-text)]">
            Previous total ($)
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
              type="number"
              step="0.01"
              value={form.previousTotal}
              onChange={(event) => onUpdate("previousTotal", Number(event.target.value))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-[var(--az-text)]">
            Current usage
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
              type="number"
              step="0.01"
              value={form.currentUsage}
              onChange={(event) => onUpdate("currentUsage", Number(event.target.value))}
            />
          </label>

          <label className="text-sm font-medium text-[var(--az-text)]">
            Previous usage
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--az-line)] bg-white/5 px-3 py-3 text-[var(--az-text)]"
              type="number"
              step="0.01"
              value={form.previousUsage}
              onChange={(event) => onUpdate("previousUsage", Number(event.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
