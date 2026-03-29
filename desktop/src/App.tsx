import { useState, useCallback, useEffect } from "react";
import { DropZone } from "./components/DropZone";
import { Pipeline } from "./components/Pipeline";
import { ResultView } from "./components/ResultView";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";
import type { Settings, ProcessingState, SubtitleSegment } from "./types";
import { DEFAULT_SETTINGS, getActiveApiKey } from "./types";

type AppView = "drop" | "processing" | "result";

function WindowButton({
  action,
  children,
  hoverBg = "var(--bg-hover)",
  hoverColor = "var(--text-primary)",
}: {
  action: "minimize" | "maximize" | "close";
  children: React.ReactNode;
  hoverBg?: string;
  hoverColor?: string;
}) {
  const handleClick = async () => {
    if ("__TAURI_INTERNALS__" in window) {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      if (action === "minimize") await win.minimize();
      else if (action === "maximize") {
        if (await win.isMaximized()) await win.unmaximize();
        else await win.maximize();
      } else await win.close();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-9 h-9 flex items-center justify-center rounded-md transition-colors"
      style={{ color: "var(--text-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

// Check if running inside Tauri
const IS_TAURI = "__TAURI_INTERNALS__" in window;

async function invokeCommand(cmd: string, args: Record<string, unknown>) {
  if (IS_TAURI) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke(cmd, args);
  }
  // Web fallback: mock processing
  return null;
}

async function listenEvent(event: string, handler: (payload: unknown) => void) {
  if (IS_TAURI) {
    const { listen } = await import("@tauri-apps/api/event");
    return listen(event, (e) => handler(e.payload));
  }
  return () => {};
}

// Mock for web dev mode
function mockProcess(onProgress: (state: ProcessingState) => void) {
  const mockSegments: SubtitleSegment[] = [
    { index: 1, start: 2.8, end: 6.0, original: "Hello everyone, good afternoon.", translated: "大家下午好。" },
    { index: 2, start: 6.0, end: 11.7, original: "Today we are honored to have our guest.", translated: "今天我们很荣幸邀请到我们的嘉宾。" },
    { index: 3, start: 11.7, end: 14.4, original: "He will present the roadshow for us.", translated: "他将为大家带来路演。" },
  ];

  const stages: { stage: ProcessingState["stage"]; duration: number; message: string }[] = [
    { stage: "extracting", duration: 1500, message: "Extracting audio..." },
    { stage: "transcribing", duration: 3000, message: "Transcribing with Whisper..." },
    { stage: "translating", duration: 2000, message: "Translating subtitles..." },
  ];

  let i = 0;
  const runStage = () => {
    if (i >= stages.length) {
      onProgress({ stage: "complete", progress: 100, message: "Complete", segments: mockSegments });
      return;
    }
    const { stage, duration, message } = stages[i];
    onProgress({ stage, progress: 0, message });
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      onProgress({ stage, progress: Math.min(99, Math.round((elapsed / duration) * 100)), message });
      if (elapsed >= duration) {
        clearInterval(interval);
        i++;
        runStage();
      }
    }, 100);
  };
  runStage();
}

export default function App() {
  const [view, setView] = useState<AppView>("drop");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("cvr-settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState<ProcessingState>({
    stage: "idle",
    progress: 0,
    message: "",
  });

  const saveSettings = useCallback((s: Settings) => {
    setSettings(s);
    localStorage.setItem("cvr-settings", JSON.stringify(s));
  }, []);

  const handleFileDrop = useCallback((path: string, name: string) => {
    setFilePath(path);
    setFileName(name);
  }, []);

  // Listen for progress events from Tauri backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listenEvent("cvr-progress", (payload: unknown) => {
      const p = payload as { stage: string; progress: number; message: string; data?: { segments?: SubtitleSegment[]; output?: string } };

      if (p.stage === "complete" && p.data?.segments) {
        setProcessing({
          stage: "complete",
          progress: 100,
          message: p.message,
          segments: p.data.segments,
        });
        setTimeout(() => setView("result"), 500);
      } else if (p.stage === "error") {
        setProcessing({
          stage: "error",
          progress: 0,
          message: p.message,
          error: p.message,
        });
      } else {
        setProcessing({
          stage: p.stage as ProcessingState["stage"],
          progress: p.progress,
          message: p.message,
        });
      }
    }).then((fn) => {
      if (typeof fn === "function") unlisten = fn;
    });

    return () => { unlisten?.(); };
  }, []);

  const handleStart = useCallback(() => {
    if (!filePath) return;
    setView("processing");
    setProcessing({ stage: "extracting", progress: 0, message: "Starting..." });

    if (IS_TAURI) {
      invokeCommand("start_processing", {
        videoPath: filePath,
        settings: {
          sourceLanguage: settings.sourceLanguage,
          targetLanguage: settings.targetLanguage,
          subtitleMode: settings.subtitleMode,
          whisperModel: settings.whisperModel,
          llmProvider: settings.llmProvider,
          apiKey: getActiveApiKey(settings),
          noTranslate: !getActiveApiKey(settings),
        },
      }).catch((err) => {
        setProcessing({ stage: "error", progress: 0, message: String(err), error: String(err) });
      });
    } else {
      // Web dev fallback
      mockProcess((state) => {
        setProcessing(state);
        if (state.stage === "complete") setTimeout(() => setView("result"), 500);
      });
    }
  }, [filePath, settings]);

  const handleReset = useCallback(() => {
    setView("drop");
    setFilePath("");
    setFileName("");
    setProcessing({ stage: "idle", progress: 0, message: "" });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: "var(--bg-deep)" }}>
      {/* Title bar — custom frameless */}
      <div
        className="h-11 flex items-center justify-between shrink-0"
        data-tauri-drag-region
        style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", paddingLeft: "20px", paddingRight: "8px" }}
      >
        <div
          className="flex-1 flex items-center gap-2.5 h-full"
          onMouseDown={async (e) => {
            if (e.button === 0 && "__TAURI_INTERNALS__" in window) {
              const { getCurrentWindow } = await import("@tauri-apps/api/window");
              await getCurrentWindow().startDragging();
            }
          }}
          onDoubleClick={async () => {
            if ("__TAURI_INTERNALS__" in window) {
              const { getCurrentWindow } = await import("@tauri-apps/api/window");
              const win = getCurrentWindow();
              if (await win.isMaximized()) await win.unmaximize();
              else await win.maximize();
            }
          }}
          style={{ cursor: "grab" }}
        >
          <span className="font-mono text-sm font-semibold tracking-widest pointer-events-none" style={{ color: "var(--cyan-base)" }}>
            CVR
          </span>
          <span className="text-xs pointer-events-none" style={{ color: "var(--text-muted)" }}>
            Cockpit Voice Recorder
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          {/* Minimize */}
          <WindowButton action="minimize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8" /></svg>
          </WindowButton>
          {/* Maximize */}
          <WindowButton action="maximize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="8" height="8" rx="1" /></svg>
          </WindowButton>
          {/* Close */}
          <WindowButton action="close" hoverBg="var(--red-dim)" hoverColor="var(--red-base)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l8 8M10 2l-8 8" /></svg>
          </WindowButton>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        {view === "drop" && (
          <DropZone
            filePath={filePath}
            fileName={fileName}
            onFileDrop={handleFileDrop}
            onStart={handleStart}
            hasApiKey={!!getActiveApiKey(settings)}
          />
        )}
        {view === "processing" && (
          <Pipeline state={processing} fileName={fileName} />
        )}
        {view === "result" && (
          <ResultView
            segments={processing.segments || []}
            settings={settings}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            onSave={saveSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>

      <StatusBar stage={processing.stage} fileName={fileName} />
    </div>
  );
}
