"""Translate subtitle segments using LLM APIs."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from cvr.transcribe import Segment

logger = logging.getLogger(__name__)

# Batch size: number of segments per LLM call
BATCH_SIZE = 30


@dataclass
class TranslatedSegment:
    """A segment with original and translated text."""
    index: int
    start: float
    end: float
    original: str
    translated: str
    language: str = ""


def translate_segments(
    segments: list[Segment],
    target_lang: str = "zh",
    model: str = "gpt-4o-mini",
    provider: str = "openai",
    batch_size: int = BATCH_SIZE,
) -> list[TranslatedSegment]:
    """Translate segments in batches using LLM.

    Groups segments into batches to reduce API calls while maintaining
    context for better translation quality.
    """
    results = []

    for i in range(0, len(segments), batch_size):
        batch = segments[i:i + batch_size]
        logger.info("Translating batch %d/%d (%d segments)",
                     i // batch_size + 1,
                     (len(segments) + batch_size - 1) // batch_size,
                     len(batch))

        translations = _translate_batch(batch, target_lang, model, provider)

        for seg, translated_text in zip(batch, translations):
            results.append(TranslatedSegment(
                index=seg.index,
                start=seg.start,
                end=seg.end,
                original=seg.text,
                translated=translated_text,
                language=seg.language,
            ))

    return results


def _translate_batch(
    segments: list[Segment],
    target_lang: str,
    model: str,
    provider: str,
) -> list[str]:
    """Translate a batch of segments via LLM. Returns list of translated strings."""
    # Build numbered text block
    lines = [f"{i+1}. {seg.text}" for i, seg in enumerate(segments)]
    text_block = "\n".join(lines)

    lang_names = {
        "zh": "Simplified Chinese",
        "zh-TW": "Traditional Chinese",
        "ja": "Japanese",
        "ko": "Korean",
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
    }
    target_name = lang_names.get(target_lang, target_lang)

    prompt = f"""Translate the following numbered subtitle lines to {target_name}.
Keep the numbering. Output ONLY the translated lines, one per line, matching the original numbering.
Do not add explanations. Maintain the original meaning and natural spoken tone.

{text_block}"""

    system_msg = f"You are a professional subtitle translator. Translate to {target_name}."

    if provider == "gemini":
        raw = _call_gemini(model, system_msg, prompt)
    else:
        raw = _call_openai(model, system_msg, prompt)

    # Parse numbered output
    translations = _parse_numbered_output(raw, len(segments))
    return translations


def _call_openai(model: str, system_msg: str, prompt: str) -> str:
    """Call OpenAI-compatible API."""
    from openai import OpenAI

    client = OpenAI()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def _call_gemini(model: str, system_msg: str, prompt: str) -> str:
    """Call Google Gemini API."""
    from google import genai

    client = genai.Client()
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_msg,
            temperature=0.3,
        ),
    )
    return response.text.strip()


def _parse_numbered_output(text: str, expected_count: int) -> list[str]:
    """Parse '1. xxx\\n2. yyy' format. Falls back to line-by-line split."""
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]

    results = []
    for line in lines:
        # Strip numbering: "1. text" → "text", "1) text" → "text"
        for sep in [". ", ") ", "。", "）"]:
            dot_pos = line.find(sep)
            if dot_pos != -1 and dot_pos < 5:
                prefix = line[:dot_pos]
                if prefix.isdigit():
                    line = line[dot_pos + len(sep):]
                    break
        results.append(line)

    # Pad or truncate to match expected count
    if len(results) < expected_count:
        results.extend([""] * (expected_count - len(results)))
    return results[:expected_count]
