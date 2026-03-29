import { useState, useCallback, useEffect, DragEvent } from "react";

interface DropZoneProps {
  filePath: string;
  fileName: string;
  onFileDrop: (path: string, name: string) => void;
  onStart: () => void;
  hasApiKey: boolean;
}

const ACCEPTED = [".mp4", ".mkv", ".avi", ".mov", ".webm", ".wav", ".mp3"];

interface GpuInfo {
  available: boolean;
  name: string;
  vram_mb: number;
  warning: string;
}

export function DropZone({ filePath, fileName, onFileDrop, onStart, hasApiKey }: DropZoneProps) {
  const [hovering, setHovering] = useState(false);
  const [gpu, setGpu] = useState<GpuInfo | null>(null);
  const hasFile = !!filePath;

  useEffect(() => {
    (async () => {
      if ("__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        const info = await invoke<GpuInfo>("detect_gpu");
        setGpu(info);
      }
    })();
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setHovering(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setHovering(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (ACCEPTED.includes(ext)) {
          onFileDrop(file.name, file.name);
        }
      }
    },
    [onFileDrop],
  );

  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 p-8">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer"
        style={{
          width: hasFile ? "480px" : "520px",
          height: hasFile ? "180px" : "300px",
          borderColor: hovering
            ? "var(--cyan-base)"
            : hasFile
              ? "var(--green-base)"
              : "var(--border-default)",
          background: hovering
            ? "var(--cyan-dim)"
            : hasFile
              ? "var(--green-dim)"
              : "var(--bg-surface)",
          boxShadow: hovering
            ? "0 0 30px var(--cyan-glow), inset 0 0 30px var(--cyan-glow)"
            : hasFile
              ? "0 0 20px var(--green-glow)"
              : "none",
        }}
        onClick={async () => {
          if ("__TAURI_INTERNALS__" in window) {
            const { open } = await import("@tauri-apps/plugin-dialog");
            const selected = await open({
              filters: [{ name: "Video", extensions: ["mp4", "mkv", "avi", "mov", "webm", "wav", "mp3"] }],
              multiple: false,
            });
            if (selected) {
              const path = typeof selected === "string" ? selected : selected;
              const name = path.split(/[/\\]/).pop() || path;
              onFileDrop(path, name);
            }
          } else {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ACCEPTED.join(",");
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) onFileDrop(file.name, file.name);
            };
            input.click();
          }
        }}
      >
        {!hasFile ? (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 48 48"
              fill="none"
              stroke={hovering ? "var(--cyan-base)" : "var(--text-muted)"}
              strokeWidth="1.5"
              className="mb-5 transition-colors"
            >
              <path d="M24 32V16M24 16l-8 8M24 16l8 8" />
              <path d="M8 32v4a4 4 0 004 4h24a4 4 0 004-4v-4" />
            </svg>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Drop video file here
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              MP4, MKV, AVI, MOV, WebM
            </p>
          </>
        ) : (
          <>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--green-base)"
              strokeWidth="2"
              className="mb-3"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <p
              className="text-base font-medium text-center px-6"
              style={{ color: "var(--text-primary)", wordBreak: "break-all" }}
            >
              {fileName}
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Click to change
            </p>
          </>
        )}
      </div>

      {/* Start button — Linear style */}
      <button
        onClick={onStart}
        disabled={!hasFile}
        className="rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          padding: "10px 32px",
          background: hasFile
            ? "linear-gradient(180deg, rgba(0,230,138,0.15) 0%, rgba(0,230,138,0.06) 100%)"
            : "var(--bg-elevated)",
          color: hasFile ? "var(--green-base)" : "var(--text-muted)",
          border: hasFile ? "1px solid rgba(0,230,138,0.3)" : "1px solid var(--border-default)",
          boxShadow: hasFile ? "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
          cursor: hasFile ? "pointer" : "not-allowed",
          opacity: hasFile ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (hasFile) {
            e.currentTarget.style.background = "linear-gradient(180deg, rgba(0,230,138,0.25) 0%, rgba(0,230,138,0.1) 100%)";
            e.currentTarget.style.borderColor = "rgba(0,230,138,0.5)";
          }
        }}
        onMouseLeave={(e) => {
          if (hasFile) {
            e.currentTarget.style.background = "linear-gradient(180deg, rgba(0,230,138,0.15) 0%, rgba(0,230,138,0.06) 100%)";
            e.currentTarget.style.borderColor = "rgba(0,230,138,0.3)";
          }
        }}
      >
        {hasFile ? "Start Processing" : "Select a File"}
      </button>

      {!hasApiKey && (
        <p className="text-sm" style={{ color: "var(--amber-base)" }}>
          Set your API key in settings to enable translation
        </p>
      )}

      {/* GPU info */}
      {gpu && (
        <div className="flex items-center gap-2" style={{ fontSize: "13px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: gpu.available ? "var(--green-base)" : "var(--amber-base)",
              boxShadow: gpu.available ? "0 0 6px var(--green-glow)" : "0 0 6px var(--amber-glow)",
            }}
          />
          {gpu.available ? (
            <span style={{ color: "var(--text-secondary)" }}>
              <span className="font-mono" style={{ color: "var(--green-base)" }}>{gpu.name}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                {(gpu.vram_mb / 1024).toFixed(0)}GB VRAM
              </span>
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>No GPU detected — CPU mode</span>
          )}
          {gpu.warning && (
            <span style={{ color: "var(--amber-base)", marginLeft: "4px" }}>
              — {gpu.warning}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
