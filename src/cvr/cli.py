"""CLI interface for CVR subtitle generator."""

from __future__ import annotations

import json
import logging
import os
import sys
import time
from pathlib import Path

import click


def _emit(stage: str, progress: int = 0, message: str = "", data: dict | None = None):
    """Print a JSON progress line for machine consumption."""
    import sys
    obj = {"stage": stage, "progress": progress, "message": message}
    if data:
        obj["data"] = data
    # Force UTF-8 output to avoid Windows cp932 encoding errors
    sys.stdout.buffer.write((json.dumps(obj, ensure_ascii=False) + "\n").encode("utf-8"))
    sys.stdout.buffer.flush()


@click.command()
@click.argument("video", type=click.Path(exists=False))
@click.option("-o", "--output", type=click.Path(), default=None,
              help="Output SRT file path (default: same name as video)")
@click.option("-l", "--language", default=None,
              help="Source language code (e.g. en, ja). Default: auto-detect")
@click.option("-t", "--target", default="zh",
              help="Target translation language (default: zh)")
@click.option("--no-translate", is_flag=True,
              help="Skip translation, output original language only")
@click.option("-m", "--model", default="large-v3",
              help="Whisper model size (tiny/base/small/medium/large-v3)")
@click.option("--provider", type=click.Choice(["openai", "gemini"]),
              default="openai", help="LLM provider (default: openai)")
@click.option("--llm", default=None,
              help="LLM model name (default: gpt-4o-mini for openai, gemini-2.5-flash for gemini)")
@click.option("--api-key", default=None, help="API key (alternative to env var)")
@click.option("--mode", type=click.Choice(["bilingual", "translated", "original"]),
              default="bilingual", help="Subtitle mode (default: bilingual)")
@click.option("--device", default="auto",
              help="Whisper device: cuda, cpu, or auto")
@click.option("--json-progress", "json_progress", is_flag=True,
              help="Output JSON progress lines (for GUI integration)")
@click.option("-v", "--verbose", is_flag=True, help="Verbose logging")
def main(
    video: str,
    output: str | None,
    language: str | None,
    target: str,
    no_translate: bool,
    model: str,
    provider: str,
    llm: str | None,
    api_key: str | None,
    mode: str,
    device: str,
    json_progress: bool,
    verbose: bool,
):
    """CVR - Generate translated subtitles from video.

    \b
    Examples:
      cvr movie.mp4                          # Auto-detect -> Chinese bilingual subs
      cvr movie.mp4 -t ja                    # Translate to Japanese
      cvr movie.mp4 --no-translate           # Transcribe only, no translation
      cvr movie.mp4 --provider gemini        # Use Gemini 2.5 Flash
      cvr movie.mp4 -m small --device cpu    # Use smaller model on CPU
    """
    log = _emit if json_progress else lambda stage, progress=0, message="", data=None: click.echo(message)

    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.WARNING,
        format="%(message)s",
    )

    # Set API key from --api-key arg if provided
    if api_key:
        if provider == "gemini":
            os.environ["GEMINI_API_KEY"] = api_key
        else:
            os.environ["OPENAI_API_KEY"] = api_key

    video_path = Path(video)
    if not video_path.exists():
        log("error", 0, f"File not found: {video}")
        sys.exit(1)
    if output is None:
        suffix = f".{target}" if not no_translate else ""
        output = str(video_path.with_suffix(f"{suffix}.srt"))

    total_start = time.time()

    # Step 1: Extract audio
    log("extracting", 0, f"Extracting audio from {video_path.name}...")
    from cvr.audio import extract_audio
    audio_path = extract_audio(video_path)
    log("extracting", 100, f"Audio extracted: {audio_path.stat().st_size / 1024 / 1024:.1f} MB")

    # Step 2: Transcribe
    log("transcribing", 5, f"Loading whisper-{model} (first run downloads ~2.9GB)...")
    t0 = time.time()
    from cvr.transcribe import transcribe
    log("transcribing", 20, f"Model loaded, transcribing...")
    segments = transcribe(audio_path, model_size=model, language=language, device=device)
    elapsed = time.time() - t0
    log("transcribing", 100, f"{len(segments)} segments in {elapsed:.1f}s")

    audio_path.unlink(missing_ok=True)

    if not segments:
        log("error", 0, "No speech detected.")
        sys.exit(1)

    # Step 3: Translate (optional)
    if no_translate:
        from cvr.srt import segments_to_srt, write_srt
        srt_content = segments_to_srt(segments)
        log("translating", 100, "Skipped (--no-translate)")
    else:
        default_models = {"openai": "gpt-4o-mini", "gemini": "gemini-2.5-flash"}
        llm_model = llm or default_models.get(provider, "gpt-4o-mini")

        key_env = "GEMINI_API_KEY" if provider == "gemini" else "OPENAI_API_KEY"
        if not os.environ.get(key_env):
            log("error", 0, f"{key_env} not set")
            sys.exit(1)

        log("translating", 0, f"Translating with {provider}/{llm_model}...")
        t0 = time.time()
        from cvr.translate import translate_segments
        translated = translate_segments(
            segments, target_lang=target, model=llm_model, provider=provider,
        )
        elapsed = time.time() - t0
        log("translating", 100, f"Translated {len(translated)} segments in {elapsed:.1f}s")

        from cvr.srt import translated_to_srt, write_srt
        srt_content = translated_to_srt(translated, mode=mode)

    # Step 4: Write SRT
    write_srt(srt_content, output)
    total_time = time.time() - total_start

    # Build segments data for GUI
    segments_data = []
    if no_translate:
        for seg in segments:
            segments_data.append({
                "index": seg.index + 1,
                "start": seg.start,
                "end": seg.end,
                "original": seg.text,
                "translated": "",
            })
    else:
        for seg in translated:
            segments_data.append({
                "index": seg.index + 1,
                "start": seg.start,
                "end": seg.end,
                "original": seg.original,
                "translated": seg.translated,
            })

    log("complete", 100, f"Saved: {output} ({total_time:.1f}s)", data={
        "output": output,
        "segments": segments_data,
        "total_seconds": round(total_time, 1),
    })


if __name__ == "__main__":
    main()
