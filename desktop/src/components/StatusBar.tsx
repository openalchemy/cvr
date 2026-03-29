import type { ProcessingStage } from "../types";

interface StatusBarProps {
  stage: ProcessingStage;
  fileName: string;
}

export function StatusBar({ stage, fileName }: StatusBarProps) {
  const statusColor =
    stage === "complete"
      ? "var(--green-base)"
      : stage === "error"
        ? "var(--red-base)"
        : stage === "idle"
          ? "var(--text-muted)"
          : "var(--cyan-base)";

  const statusText =
    stage === "idle"
      ? "Ready"
      : stage === "complete"
        ? "Complete"
        : stage === "error"
          ? "Error"
          : "Processing";

  return (
    <div
      className="flex items-center justify-between shrink-0 font-mono"
      style={{
        height: "32px",
        paddingLeft: "20px",
        paddingRight: "20px",
        fontSize: "12px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        color: "var(--text-muted)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: statusColor }}
        />
        <span style={{ color: statusColor }}>{statusText}</span>
      </div>
      {fileName && (
        <span className="truncate max-w-[200px]">{fileName}</span>
      )}
    </div>
  );
}
