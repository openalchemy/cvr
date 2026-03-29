"""Extract audio from video files using ffmpeg."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path


def extract_audio(video_path: str | Path, sample_rate: int = 16000) -> Path:
    """Extract audio from video as 16kHz mono WAV.

    Returns path to temporary WAV file. Caller is responsible for cleanup.
    """
    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    audio_path = Path(tempfile.mktemp(suffix=".wav"))

    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vn",                  # no video
        "-acodec", "pcm_s16le", # 16-bit PCM
        "-ar", str(sample_rate),
        "-ac", "1",             # mono
        str(audio_path),
        "-y",                   # overwrite
    ]

    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", errors="replace")[-500:]
        raise RuntimeError(f"ffmpeg failed: {stderr}")

    return audio_path
