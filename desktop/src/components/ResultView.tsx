import type { SubtitleSegment, Settings } from "../types";

interface ResultViewProps {
  segments: SubtitleSegment[];
  settings: Settings;
  fileName: string;
  onReset: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

function toSrt(segments: SubtitleSegment[], mode: Settings["subtitleMode"]): string {
  return segments
    .map((seg, i) => {
      const lines = [`${i + 1}`, `${formatTime(seg.start)} --> ${formatTime(seg.end)}`];
      if (mode === "bilingual") {
        lines.push(seg.original, seg.translated);
      } else if (mode === "translated") {
        lines.push(seg.translated);
      } else {
        lines.push(seg.original);
      }
      lines.push("");
      return lines.join("\n");
    })
    .join("\n");
}

export function ResultView({ segments, settings, fileName, onReset }: ResultViewProps) {
  const handleExport = async () => {
    const content = toSrt(segments, settings.subtitleMode);
    const defaultName = fileName.replace(/\.[^.]+$/, "") + `.${settings.targetLanguage}.srt`;

    if ("__TAURI_INTERNALS__" in window) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");
      const path = await save({
        defaultPath: defaultName,
        filters: [{ name: "SRT Subtitle", extensions: ["srt"] }],
      });
      if (path) {
        await invoke("save_srt", { content, outputPath: path });
      }
    } else {
      // Web fallback
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--green-base)" strokeWidth="2">
            <path d="M13.5 4.5L6 12 2.5 8.5" />
          </svg>
          <span className="text-xs font-mono font-medium tracking-widest" style={{ color: "var(--green-base)" }}>
            {segments.length} SEGMENTS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              padding: "8px 20px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            New File
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              padding: "8px 20px",
              background: "linear-gradient(180deg, rgba(0,230,138,0.15) 0%, rgba(0,230,138,0.06) 100%)",
              color: "var(--green-base)",
              border: "1px solid rgba(0,230,138,0.3)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(180deg, rgba(0,230,138,0.25) 0%, rgba(0,230,138,0.1) 100%)";
              e.currentTarget.style.borderColor = "rgba(0,230,138,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(180deg, rgba(0,230,138,0.15) 0%, rgba(0,230,138,0.06) 100%)";
              e.currentTarget.style.borderColor = "rgba(0,230,138,0.3)";
            }}
          >
            Export .SRT
          </button>
        </div>
      </div>

      {/* Subtitle list */}
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 2px" }}>
          <thead>
            <tr className="text-left">
              <th className="text-xs font-mono font-medium tracking-wider px-3 py-2 w-10" style={{ color: "var(--text-muted)" }}>#</th>
              <th className="text-xs font-mono font-medium tracking-wider px-3 py-2 w-40" style={{ color: "var(--text-muted)" }}>TIME</th>
              <th className="text-xs font-mono font-medium tracking-wider px-3 py-2" style={{ color: "var(--text-muted)" }}>ORIGINAL</th>
              <th className="text-xs font-mono font-medium tracking-wider px-3 py-2" style={{ color: "var(--text-muted)" }}>TRANSLATED</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => (
              <tr
                key={seg.index}
                className="transition-colors"
                style={{ background: "var(--bg-surface)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
              >
                <td className="px-3 py-2.5 rounded-l-md font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {seg.index}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--cyan-base)" }}>
                  {formatTime(seg.start)}
                </td>
                <td className="px-3 py-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  {seg.original}
                </td>
                <td className="px-3 py-2.5 rounded-r-md text-sm" style={{ color: "var(--text-secondary)" }}>
                  {seg.translated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
