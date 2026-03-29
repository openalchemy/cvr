"""Whisper transcription with timestamps."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class Segment:
    """A single transcription segment with timing."""
    index: int
    start: float
    end: float
    text: str
    language: str = ""


def _has_cuda() -> bool:
    """Check if CUDA is available."""
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False


def transcribe(
    audio_path: str | Path,
    model_size: str = "large-v3",
    language: str | None = None,
    device: str = "auto",
) -> list[Segment]:
    """Transcribe audio file using faster-whisper.

    Parameters
    ----------
    audio_path : path to audio/video file
    model_size : whisper model (tiny, base, small, medium, large-v3)
    language : force language code (e.g. "en", "ja"), None for auto-detect
    device : "cuda", "cpu", or "auto"

    Returns list of Segments with timestamps.
    """
    from faster_whisper import WhisperModel

    # float16 only works on CUDA, use int8 for CPU
    if device == "cpu" or (device == "auto" and not _has_cuda()):
        actual_device = "cpu"
        compute_type = "int8"
    else:
        actual_device = "cuda"
        compute_type = "float16"

    logger.info("Loading whisper model: %s (device=%s, compute=%s)", model_size, actual_device, compute_type)
    model = WhisperModel(model_size, device=actual_device, compute_type=compute_type)

    logger.info("Transcribing: %s", audio_path)
    segments_iter, info = model.transcribe(
        str(audio_path),
        beam_size=5,
        language=language,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
    )

    segments = []
    for i, seg in enumerate(segments_iter):
        text = seg.text.strip()
        if not text:
            continue
        segments.append(Segment(
            index=i,
            start=round(seg.start, 3),
            end=round(seg.end, 3),
            text=text,
            language=info.language,
        ))

    logger.info(
        "Transcribed %d segments, language=%s (%.1f%%), duration=%.1fs",
        len(segments), info.language, info.language_probability * 100, info.duration,
    )
    return segments
