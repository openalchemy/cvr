# CVR — Cockpit Voice Recorder

AI-powered video subtitle generator. Transcribe any video with Whisper and translate subtitles using OpenAI or Gemini.

Available as a **CLI tool** and a **desktop app** (Windows / macOS).

```
video → ffmpeg → Whisper (GPU) → LLM translate → .srt
```

<p align="center">
  <img src="desktop/icon-128.png" alt="CVR" width="64" />
</p>

## Features

- **GPU-accelerated transcription** — faster-whisper with CUDA support (auto-detects GPU)
- **Multiple Whisper models** — small, medium, large-v3 (choose speed vs accuracy)
- **Multi-provider translation** — OpenAI (GPT-4o-mini) or Google Gemini (2.5 Flash)
- **Bilingual subtitles** — original + translated text in one .srt file
- **7 languages** — English, Chinese, Japanese, Korean, Spanish, French, German
- **Desktop app** — drag & drop UI built with Tauri + React, aviation-inspired dark theme

## Desktop App

The desktop app provides a visual interface with real-time processing progress.

### Requirements

- [Python 3.10+](https://python.org) with `cvr` CLI installed
- [ffmpeg](https://ffmpeg.org/download.html) in PATH
- NVIDIA GPU recommended (CUDA) — falls back to CPU if unavailable

### Install & Run

```bash
# Install the CLI backend
pip install cvr

# Run the desktop app (dev mode)
cd desktop
npm install
npm run tauri dev
```

### Build Installer

```bash
cd desktop
npm run tauri build
# Output: desktop/src-tauri/target/release/bundle/
```

## CLI

### Install

```bash
pip install cvr
```

> **Windows note**: If `cvr` is not recognized after install, use `python -m cvr` instead.

### Usage

**macOS / Linux:**
```bash
# Auto-detect language, translate to Chinese (bilingual)
cvr movie.mp4

# Translate to Japanese
cvr movie.mp4 -t ja

# Use Gemini for translation
cvr movie.mp4 --provider gemini

# English source, Chinese translation only
cvr movie.mp4 -l en -t zh --mode translated

# Transcribe only, no translation
cvr movie.mp4 --no-translate

# Smaller model on CPU
cvr movie.mp4 -m small --device cpu
```

**Windows (PowerShell):**
```powershell
# Use python -m cvr if cvr.exe is not in PATH
python -m cvr movie.mp4

# Set API key and translate
$env:OPENAI_API_KEY = "sk-xxx"
python -m cvr movie.mp4

# Or use Gemini
$env:GEMINI_API_KEY = "AIza-xxx"
python -m cvr movie.mp4 --provider gemini

# Or pass API key directly
python -m cvr movie.mp4 --provider gemini --api-key "AIza-xxx"

# Network paths (UNC) — use forward slashes
python -m cvr "//server/share/movie.mp4"
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output` | `{video}.{lang}.srt` | Output file path |
| `-l, --language` | auto-detect | Source language code |
| `-t, --target` | `zh` | Target translation language |
| `--provider` | `openai` | `openai` or `gemini` |
| `--llm` | auto | Model name (default: `gpt-4o-mini` / `gemini-2.5-flash`) |
| `--api-key` | env var | API key (alternative to environment variable) |
| `-m, --model` | `large-v3` | Whisper model: `small`, `medium`, `large-v3` |
| `--mode` | `bilingual` | `bilingual`, `translated`, or `original` |
| `--device` | `auto` | `cuda`, `cpu`, or `auto` |
| `--no-translate` | | Transcribe only |
| `--json-progress` | | Output JSON lines (for GUI integration) |

### Whisper Models

| Model | Size | VRAM | Speed | Best For |
|-------|------|------|-------|----------|
| `small` | 461MB | ~1GB | Fastest | Quick drafts |
| `medium` | 1.5GB | ~2GB | Balanced | Most use cases |
| `large-v3` | 2.9GB | ~6GB | Slowest | Maximum accuracy, rare languages |

### Environment Variables

```bash
# OpenAI (for translation)
export OPENAI_API_KEY=sk-xxx

# Gemini (for translation)
export GEMINI_API_KEY=AIza-xxx
```

## Output Example

**Bilingual mode** (default):
```srt
1
00:00:02,800 --> 00:00:06,000
Hello everyone, good afternoon
大家下午好

2
00:00:06,000 --> 00:00:11,700
Today we are honored to have our guest
今天我们很荣幸邀请到我们的嘉宾
```

**Translated only** (`--mode translated`):
```srt
1
00:00:02,800 --> 00:00:06,000
大家下午好
```

## How It Works

1. **ffmpeg** extracts audio from video (16kHz mono WAV)
2. **faster-whisper** transcribes with GPU acceleration and timestamps
3. **LLM** (OpenAI or Gemini) translates in batches of 30 segments for context coherence
4. Generates standard **.srt** subtitle file

## Tech Stack

- **CLI**: Python, faster-whisper, ffmpeg, OpenAI SDK, Google GenAI SDK
- **Desktop**: Tauri 2 (Rust) + React + TypeScript + Tailwind CSS
- **GPU**: CUDA via PyTorch + CTranslate2

## Project Structure

```
cvr/
├── src/cvr/           # Python CLI
│   ├── cli.py         # CLI entry point
│   ├── audio.py       # ffmpeg audio extraction
│   ├── transcribe.py  # Whisper transcription
│   ├── translate.py   # LLM translation (OpenAI / Gemini)
│   └── srt.py         # SRT file generation
├── desktop/           # Tauri desktop app
│   ├── src/           # React frontend
│   └── src-tauri/     # Rust backend
├── pyproject.toml
├── LICENSE            # MIT
└── README.md
```

## Disclaimer

This software is provided as a general-purpose transcription and translation tool. **Users are solely responsible for ensuring their use complies with all applicable laws and regulations**, including but not limited to:

- **Copyright law**: Generating subtitles for copyrighted content may require authorization from the rights holder. This tool does not grant any rights to the underlying media.
- **Fair use / fair dealing**: Whether subtitle generation constitutes fair use depends on your jurisdiction and specific circumstances. Consult legal counsel if uncertain.
- **Distribution**: Subtitles derived from copyrighted works may themselves be subject to copyright restrictions. Redistribution of generated subtitle files is at your own risk.
- **Accuracy**: Machine-generated transcriptions and translations may contain errors. The authors make no guarantees regarding the accuracy, completeness, or fitness for any purpose of the generated output.

The authors and contributors of CVR **accept no liability** for any content generated using this software, any copyright infringement arising from its use, or any damages resulting from reliance on its output. Use at your own risk.

By using this software, you acknowledge that you have the legal right to process the media files you provide.

## License

MIT
