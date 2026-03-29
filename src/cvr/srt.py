"""SRT subtitle file generation."""

from __future__ import annotations

from pathlib import Path

from cvr.transcribe import Segment
from cvr.translate import TranslatedSegment


def _format_time(seconds: float) -> str:
    """Format seconds to SRT timestamp: HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def segments_to_srt(segments: list[Segment]) -> str:
    """Convert transcription segments to SRT format (single language)."""
    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{_format_time(seg.start)} --> {_format_time(seg.end)}")
        lines.append(seg.text)
        lines.append("")
    return "\n".join(lines)


def translated_to_srt(
    segments: list[TranslatedSegment],
    mode: str = "bilingual",
) -> str:
    """Convert translated segments to SRT format.

    mode:
      "bilingual" — both original and translated text (two lines per subtitle)
      "translated" — translated text only
      "original" — original text only
    """
    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{_format_time(seg.start)} --> {_format_time(seg.end)}")

        if mode == "bilingual":
            lines.append(seg.original)
            lines.append(seg.translated)
        elif mode == "translated":
            lines.append(seg.translated)
        else:
            lines.append(seg.original)

        lines.append("")
    return "\n".join(lines)


def write_srt(content: str, output_path: str | Path) -> Path:
    """Write SRT content to file."""
    output_path = Path(output_path)
    output_path.write_text(content, encoding="utf-8")
    return output_path
