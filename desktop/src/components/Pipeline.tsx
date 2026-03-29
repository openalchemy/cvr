import type { ProcessingState, ProcessingStage } from "../types";

interface PipelineProps {
  state: ProcessingState;
  fileName: string;
}

const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: "extracting", label: "EXTRACT AUDIO" },
  { key: "transcribing", label: "TRANSCRIBE" },
  { key: "translating", label: "TRANSLATE" },
  { key: "complete", label: "COMPLETE" },
];

function stageStatus(current: ProcessingStage, stageKey: ProcessingStage): "pending" | "active" | "done" {
  const order: ProcessingStage[] = ["extracting", "transcribing", "translating", "complete"];
  const ci = order.indexOf(current);
  const si = order.indexOf(stageKey);
  if (si < ci) return "done";
  if (si === ci) return current === "complete" ? "done" : "active";
  return "pending";
}

export function Pipeline({ state, fileName }: PipelineProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center" style={{ gap: "12px", padding: "32px" }}>
      {/* File name — full, no truncation */}
      <p className="font-mono text-center" style={{
        color: "var(--text-muted)",
        fontSize: "14px",
        wordBreak: "break-all",
        maxWidth: "700px",
        padding: "0 20px",
        marginBottom: "24px",
      }}>
        {fileName}
      </p>

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {STAGES.map((stage, i) => {
          const status = stageStatus(state.stage, stage.key);
          const isActive = status === "active";
          const isDone = status === "done";

          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              {/* Connector + dot */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "28px" }}>
                <div
                  className={isActive ? "pulse" : ""}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "2px solid",
                    transition: "all 0.3s",
                    borderColor: isDone
                      ? "var(--green-base)"
                      : isActive
                        ? "var(--cyan-base)"
                        : "var(--border-default)",
                    background: isDone
                      ? "var(--green-base)"
                      : isActive
                        ? "var(--cyan-base)"
                        : "transparent",
                    boxShadow: isActive ? "0 0 10px var(--cyan-glow)" : isDone ? "0 0 10px var(--green-glow)" : "none",
                  }}
                />
                {i < STAGES.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      height: "48px",
                      transition: "background 0.3s",
                      background: isDone ? "var(--green-base)" : "var(--border-subtle)",
                    }}
                  />
                )}
              </div>

              {/* Label + progress */}
              <div style={{ paddingBottom: "28px" }}>
                <p
                  className="font-mono font-medium"
                  style={{
                    fontSize: "14px",
                    letterSpacing: "0.12em",
                    transition: "color 0.3s",
                    color: isDone
                      ? "var(--green-base)"
                      : isActive
                        ? "var(--cyan-base)"
                        : "var(--text-muted)",
                  }}
                >
                  {stage.label}
                </p>

                {/* Progress bar for active stage */}
                {isActive && state.stage !== "complete" && (
                  <div style={{ marginTop: "10px", width: "260px" }}>
                    <div
                      style={{ height: "4px", borderRadius: "4px", overflow: "hidden", background: "var(--bg-elevated)" }}
                    >
                      <div
                        className="shimmer"
                        style={{ height: "100%", borderRadius: "4px", transition: "width 0.2s", width: `${state.progress}%` }}
                      />
                    </div>
                    <p className="font-mono" style={{ fontSize: "12px", marginTop: "6px", color: "var(--text-muted)" }}>
                      {state.progress}%
                    </p>
                  </div>
                )}

                {/* Done checkmark */}
                {isDone && stage.key !== "complete" && (
                  <p style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-muted)" }}>
                    Done
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
