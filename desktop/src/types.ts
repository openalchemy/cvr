export interface Settings {
  llmProvider: "openai" | "gemini";
  openaiApiKey: string;
  geminiApiKey: string;
  sourceLanguage: string; // "auto" or language code
  targetLanguage: string;
  subtitleMode: "bilingual" | "translated" | "original";
  whisperModel: "small" | "medium" | "large-v3";
}

/** Get the active API key based on current provider */
export function getActiveApiKey(settings: Settings): string {
  return settings.llmProvider === "gemini" ? settings.geminiApiKey : settings.openaiApiKey;
}

export const LLM_MODELS = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
} as const;

export interface SubtitleSegment {
  index: number;
  start: number;
  end: number;
  original: string;
  translated: string;
}

export type ProcessingStage = "idle" | "extracting" | "transcribing" | "translating" | "complete" | "error";

export interface ProcessingState {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  segments?: SubtitleSegment[];
  error?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  llmProvider: "openai",
  openaiApiKey: "",
  geminiApiKey: "",
  sourceLanguage: "auto",
  targetLanguage: "zh-TW",
  subtitleMode: "bilingual",
  whisperModel: "medium",
};

export const LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "\ud83c\uddfa\ud83c\uddf8 English" },
  { code: "zh-TW", label: "\ud83c\uddf9\ud83c\uddfc \u7e41\u9ad4\u4e2d\u6587" },
  { code: "ja", label: "\ud83c\uddef\ud83c\uddf5 \u65e5\u672c\u8a9e" },
  { code: "ko", label: "\ud83c\uddf0\ud83c\uddf7 \ud55c\uad6d\uc5b4" },
  { code: "es", label: "\ud83c\uddea\ud83c\uddf8 Espa\u00f1ol" },
  { code: "fr", label: "\ud83c\uddeb\ud83c\uddf7 Fran\u00e7ais" },
  { code: "de", label: "\ud83c\udde9\ud83c\uddea Deutsch" },
  { code: "zh", label: "\ud83c\udde8\ud83c\uddf3 \u7b80\u4f53\u4e2d\u6587" },
];

export const TARGET_LANGUAGES = LANGUAGES.filter((l) => l.code !== "auto");
