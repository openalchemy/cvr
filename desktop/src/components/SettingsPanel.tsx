import { useState } from "react";
import type { Settings } from "../types";
import { LANGUAGES, TARGET_LANGUAGES, LLM_MODELS } from "../types";

interface SettingsPanelProps {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ background: "var(--bg-deep)", border: "1px solid var(--border-subtle)" }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 px-3 py-2 text-sm font-medium transition-all"
          style={{
            background: value === opt.value ? "var(--cyan-dim)" : "transparent",
            color: value === opt.value ? "var(--cyan-base)" : "var(--text-muted)",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({ settings, onSave, onClose }: SettingsPanelProps) {
  const [local, setLocal] = useState(settings);
  const [showKey, setShowKey] = useState(false);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) => {
    const next = { ...local, [key]: val };
    setLocal(next);
    onSave(next);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 z-50 flex flex-col slide-in"
        style={{
          width: "380px",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)", padding: "16px 24px" }}>
          <span className="text-sm font-mono font-medium tracking-widest" style={{ color: "var(--text-secondary)" }}>
            SETTINGS
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: "20px 24px", gap: "24px" }}>
          {/* LLM Provider */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              LLM PROVIDER
            </label>
            <SegmentedControl
              options={[
                { value: "openai" as const, label: "OpenAI" },
                { value: "gemini" as const, label: "Gemini" },
              ]}
              value={local.llmProvider}
              onChange={(v) => update("llmProvider", v)}
            />
          </div>

          {/* LLM Model */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              MODEL
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LLM_MODELS[local.llmProvider].map((m) => (
                <button
                  key={m.value}
                  className="px-3 py-1.5 rounded text-sm font-mono transition-all"
                  style={{
                    background: "var(--bg-deep)",
                    border: `1px solid var(--border-subtle)`,
                    color: "var(--cyan-base)",
                    opacity: 0.7,
                  }}
                  title={m.value}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-sm font-mono mt-2" style={{ color: "var(--text-muted)" }}>
              Default: {local.llmProvider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash"}
            </p>
          </div>

          {/* API Key — per provider */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              {local.llmProvider === "openai" ? "OPENAI API KEY" : "GEMINI API KEY"}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={local.llmProvider === "openai" ? local.openaiApiKey : local.geminiApiKey}
                onChange={(e) => update(local.llmProvider === "openai" ? "openaiApiKey" : "geminiApiKey", e.target.value)}
                placeholder={local.llmProvider === "openai" ? "sk-..." : "AIza..."}
                className="w-full px-3 py-2 rounded-md text-sm font-mono outline-none transition-colors"
                style={{
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--cyan-base)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                  {showKey ? (
                    <>
                      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                      <circle cx="7" cy="7" r="2" />
                    </>
                  ) : (
                    <>
                      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                      <path d="M2 2l10 10" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Source Language */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              SOURCE LANGUAGE
            </label>
            <select
              value={local.sourceLanguage}
              onChange={(e) => update("sourceLanguage", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              TARGET LANGUAGE
            </label>
            <select
              value={local.targetLanguage}
              onChange={(e) => update("targetLanguage", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              {TARGET_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Subtitle Mode */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              SUBTITLE MODE
            </label>
            <SegmentedControl
              options={[
                { value: "bilingual" as const, label: "Bilingual" },
                { value: "translated" as const, label: "Translated" },
                { value: "original" as const, label: "Original" },
              ]}
              value={local.subtitleMode}
              onChange={(v) => update("subtitleMode", v)}
            />
          </div>

          {/* Whisper Model */}
          <div>
            <label className="block text-sm font-mono font-medium tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              WHISPER MODEL
            </label>
            <SegmentedControl
              options={[
                { value: "small" as const, label: "Small" },
                { value: "medium" as const, label: "Medium" },
                { value: "large-v3" as const, label: "Large" },
              ]}
              value={local.whisperModel}
              onChange={(v) => update("whisperModel", v)}
            />
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              {local.whisperModel === "small" && "Fastest, lower accuracy"}
              {local.whisperModel === "medium" && "Balanced speed and accuracy"}
              {local.whisperModel === "large-v3" && "Best accuracy, slower"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
