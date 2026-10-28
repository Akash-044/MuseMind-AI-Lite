import os
import base64
import requests

from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="MuseMind AI Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MUSICGEN_API_URL = os.getenv(
    "MUSICGEN_API_URL", ""
).rstrip("/")

MUSICGEN_API_TOKEN = os.getenv(
    "MUSICGEN_API_TOKEN", ""
)


class MusicRequest(BaseModel):
    prompt: str
    mood: str = "Calm"
    genre: str = "Ambient"
    instrument: str = "Piano"
    duration: int = Field(default=5, ge=5, le=30)


def build_prompt(request: MusicRequest) -> str:
    return (
        f"{request.prompt.strip()}. "
        f"{request.mood} {request.genre} music "
        f"featuring {request.instrument}. "
        f"Description: {request.prompt.strip()}"
    )


def generate_audio(prompt: str, duration: int = 5) -> bytes:
    if not MUSICGEN_API_URL or not MUSICGEN_API_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="MusicGen connection is not configured."
        )

    try:
        response = requests.post(
            f"{MUSICGEN_API_URL}/generate",
            json={
                "prompt": prompt,
                "duration": duration,
                "max_new_tokens": 256
            },
            headers={
                "Authorization": f"Bearer {MUSICGEN_API_TOKEN}"
            },
            timeout=300
        )

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach MusicGen on Colab: {error}"
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=(
                f"MusicGen returned HTTP {response.status_code}: "
                f"{response.text[:300]}"
            )
        )

    return response.content


@app.get("/")
def home():
    return {"message": "MuseMind AI Lite API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/generate")
def generate(request: MusicRequest):
    prompt = build_prompt(request)

    audio_bytes = generate_audio(
        prompt=prompt,
        duration=request.duration
    )

    return {
        "message": "Music generated successfully!",
        "received_prompt": prompt,
        "audio_base64": base64.b64encode(
            audio_bytes
        ).decode("utf-8"),
        "audio_mime_type": "audio/wav",
        "duration_requested": request.duration,
        "status": "success"
    }


@app.post("/compare")
def compare(request: MusicRequest):
    original_prompt = build_prompt(request)

    enhanced_prompt = (
        f"{original_prompt}. "
        f"Use a clear musical arrangement, balanced dynamics, "
        f"and a cohesive atmosphere."
    )

    original_audio = generate_audio(
        original_prompt,
        request.duration
    )

    enhanced_audio = generate_audio(
        enhanced_prompt,
        request.duration
    )

    return {
        "original_prompt": original_prompt,
        "enhanced_prompt": enhanced_prompt,
        "original_audio_base64": base64.b64encode(
            original_audio
        ).decode("utf-8"),
        "enhanced_audio_base64": base64.b64encode(
            enhanced_audio
        ).decode("utf-8"),
        "rag_status": "Prompt enhancement demonstration",
        "message": (
            "Both versions were generated. "
            "Actual RAG retrieval is not connected yet."
        ),
        "duration_requested": request.duration
    }