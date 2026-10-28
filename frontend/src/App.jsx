import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const moods = [
  "Calm",
  "Happy",
  "Sad",
  "Energetic",
  "Cinematic",
  "Dreamy",
];

const genres = [
  "Ambient",
  "Classical",
  "Jazz",
  "Electronic",
  "Cinematic",
  "Lo-fi",
];

const instruments = [
  "Piano",
  "Guitar",
  "Flute",
  "Violin",
  "Synthesizer",
  "Orchestra",
];

const durations = [5, 10, 15, 30];

const examplePrompts = [
  "Peaceful piano music for studying on a rainy evening",
  "Cinematic orchestral music with an emotional atmosphere",
  "Dreamy ambient music with soft synthesizers",
  "Create a calm piano melody for studying",
  "Generate energetic electronic music for a workout",
  "Generate cinematic music for an emotional movie scene",
];

// Reusable icon component
function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),

    wave: (
      <>
        <path d="M3 10v4M7 6v12M11 3v18M15 8v8M19 5v14M23 10v4" />
      </>
    ),

    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
      </>
    ),

    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5M12 15V3" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    bulb: (
      <>
        <path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3h-6c0-1 0-2-1-3Z" />
      </>
    ),

    folder: (
      <>
        <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </>
    ),

    compare: (
      <>
        <path d="M12 3v18M3 8h6M15 16h6" />
        <path d="m6 5-3 3 3 3M18 13l3 3-3 3" />
      </>
    ),

    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,

    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{paths[name] || paths.music}</svg>;
}

// Convert base64 audio data into a playable audio URL
function base64ToAudioUrl(base64, mimeType = "audio/wav") {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return URL.createObjectURL(
    new Blob([bytes], { type: mimeType })
  );
}

// Reusable audio player component
function AudioResult({
  title,
  base64,
  mimeType = "audio/wav",
  filename,
  subtitle = "AI GENERATED AUDIO",
  artwork = "Calm",
}) {
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    if (!base64) {
      setAudioUrl("");
      return;
    }

    const url = base64ToAudioUrl(base64, mimeType);
    setAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [base64, mimeType]);

  if (!base64 || !audioUrl) {
    return null;
  }

  return (
    <article className="track-card">
      <div
        className={`track-artwork artwork-${artwork.toLowerCase()}`}
      >
        <div className="artwork-orbit artwork-orbit-one" />
        <div className="artwork-orbit artwork-orbit-two" />

        <Icon name="wave" size={38} />

        <span className="artwork-caption">AURALITH</span>
      </div>

      <div className="track-main">
        <div className="track-heading">
          <div className="track-info">
            <span className="eyebrow">{subtitle}</span>

            <h3>{title}</h3>

            <p>Music created from your imagination</p>
          </div>

          <a
            className="icon-button download-button"
            href={audioUrl}
            download={filename}
            aria-label={`Download ${title}`}
            title="Download audio"
          >
            <Icon name="download" />
          </a>
        </div>

        <div
          className="waveform-decoration"
          aria-hidden="true"
        >
          {Array.from({ length: 56 }, (_, index) => (
            <span
              key={index}
              style={{
                "--bar-height": `${
                  15 + Math.abs(Math.sin(index * 0.67)) * 75
                }%`,
              }}
            />
          ))}
        </div>

        <audio
          className="audio-player"
          controls
          preload="metadata"
          src={audioUrl}
        >
          Your browser does not support audio playback.
        </audio>
      </div>
    </article>
  );
}

// Main application component
function App() {
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("Calm");
  const [genre, setGenre] = useState("Ambient");
  const [instrument, setInstrument] = useState("Piano");
  const [duration, setDuration] = useState(10);

  const [activePage, setActivePage] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);

  // Clear previous generation and comparison results
  function clearResults() {
    setResult("");
    setGeneratedAudio(null);
    setComparison(null);
  }

  // Handle navigation between pages
  function choosePage(page) {
    setActivePage(page);
    setShowPrompts(false);
    clearResults();
  }

  // Fill the prompt box using an example prompt
  function useExample(example) {
    setPrompt(example);
    setActivePage("generate");
    setShowPrompts(false);
    setResult("");
  }

  // Generate music using the backend API
  async function handleGenerate() {
    if (!prompt.trim()) {
      setResult("Describe the music you want to create first.");
      return;
    }

    setLoading(true);
    clearResults();

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          mood,
          genre,
          instrument,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Music generation failed."
        );
      }

      if (data.audio_base64) {
        setGeneratedAudio({
          base64: data.audio_base64,
          mimeType: data.audio_mime_type || "audio/wav",
        });

        setResult(
          `${data.message || "Music generated successfully."}\n\nRequested duration: ${duration} seconds`
        );
      } else {
        setResult(
          `${data.message || "Request completed."}\n\nThe backend did not return audio data.`
        );
      }
    } catch (error) {
      setResult(
        `Music generation failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  // Compare original and enhanced prompts using the backend API
  async function handleCompare() {
    if (!prompt.trim()) {
      setResult(
        "Describe a piece of music before comparing prompts."
      );
      return;
    }

    setLoading(true);
    clearResults();

    try {
      const response = await fetch(`${API_URL}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          mood,
          genre,
          instrument,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Comparison request failed."
        );
      }

      setComparison(data);
    } catch (error) {
      setResult(
        `Comparison failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => choosePage("generate")}
          aria-label="Auralith home"
        >
          <img
            src="/auralith.png"
            alt="Auralith logo"
           className="brand-icon" 
          />

          <span className="brand-copy">
            <strong>Auralith</strong>
            <small>Where imagination becomes sound.</small>
          </span>
        </button>

        <nav
          className="main-nav"
          aria-label="Main navigation"
        >
          <button
            className={
              activePage === "generate"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => choosePage("generate")}
          >
            <Icon name="music" size={17} />
            Create
          </button>

          <button
            className={
              activePage === "compare"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => choosePage("compare")}
          >
            <Icon name="compare" size={17} />
            Prompt Comparison
          </button>
        </nav>

        <div className="system-status">
          <span className="status-dot" />
          Music Studio
        </div>
      </header>

      <main className="main-content">
        {/* Hero section */}
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" />
              AI MUSIC GENERATOR
            </span>

            <h1>
              Turn your imagination
              <br />
              into <span>sound.</span>
            </h1>

            <p>
              Describe a feeling, a place, or a moment.
              <br className="desktop-break" />
              Let Auralith turn your idea into music.
            </p>

            <div className="hero-tags">
              <span>✳ AI Composed</span>
              <span>♫ Instrumental Music</span>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-hidden="true"
          >
            <div className="hero-glow" />

            <div className="hero-ring hero-ring-outer" />
            <div className="hero-ring hero-ring-middle" />

            <div className="hero-ring hero-ring-inner">
              <Icon name="wave" size={78} />
            </div>

            <div className="hero-wave hero-wave-one" />
            <div className="hero-wave hero-wave-two" />

            <div className="hero-visual-caption">
              <span>YOUR IDEAS</span>
              <strong>Become sound.</strong>
            </div>
          </div>
        </section>

        {/* Music creation panel */}
        <section className="studio-panel">
          <div className="section-heading">
            <div className="section-title">
              <span className="section-icon">
                <Icon name="music" size={21} />
              </span>

              <div>
                <h2>
                  {activePage === "generate"
                    ? "Create your music"
                    : "Prompt comparison"}
                </h2>

                <p>
                  {activePage === "generate"
                    ? "Shape the sound you have in mind."
                    : "Compare the original and enhanced prompts."}
                </p>
              </div>
            </div>

            <button
              className="outline-button"
              onClick={() =>
                setShowPrompts((previous) => !previous)
              }
              aria-expanded={showPrompts}
            >
              <Icon name="bulb" size={17} />
              Examples
            </button>
          </div>

          {/* Explore example prompts */}
          {showPrompts && (
            <div className="example-prompts">
              <p className="field-label">
                EXPLORE EXAMPLE PROMPTS
              </p>

              <div className="example-prompt-list">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    className="example-prompt"
                    onClick={() => useExample(example)}
                  >
                    <span>✦ {example}</span>

                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Music prompt input */}
          <label
            className="field-label"
            htmlFor="music-prompt"
          >
            Describe your music
          </label>

          <div className="prompt-input-wrap">
            <textarea
              id="music-prompt"
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="A peaceful piano melody with gentle rain, warm ambient textures, and a dreamy atmosphere..."
              rows={3}
              maxLength={2000}
            />

            <span className="character-count">
              {prompt.length} / 2000
            </span>
          </div>

          {/* Mood, genre, instrument, and duration controls */}
          <div className="controls-grid">
            {/* Mood */}
            <div className="control-group">
              <span className="field-label">
                <span className="control-icon">◉</span>
                Mood
              </span>

              <div className="choice-list">
                {moods.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      mood === item
                        ? "choice-chip selected"
                        : "choice-chip"
                    }
                    onClick={() => setMood(item)}
                    aria-pressed={mood === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div className="control-group">
              <label
                className="field-label"
                htmlFor="genre"
              >
                <span className="control-icon">♫</span>
                Genre
              </label>

              <select
                id="genre"
                className="studio-select"
                value={genre}
                onChange={(event) =>
                  setGenre(event.target.value)
                }
              >
                {genres.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Main instrument */}
            <div className="control-group">
              <span className="field-label">
                <span className="control-icon">≋</span>
                Main instrument
              </span>

              <div className="choice-list">
                {instruments.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      instrument === item
                        ? "choice-chip selected"
                        : "choice-chip"
                    }
                    onClick={() =>
                      setInstrument(item)
                    }
                    aria-pressed={instrument === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="control-group">
              <span className="field-label">
                <Icon name="clock" size={17} />
                Duration
              </span>

              <div className="choice-list duration-list">
                {durations.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    className={
                      duration === seconds
                        ? "choice-chip selected"
                        : "choice-chip"
                    }
                    onClick={() =>
                      setDuration(seconds)
                    }
                    aria-pressed={duration === seconds}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected music settings */}
          <div className="selected-style">
            <span className="selected-style-label">
              YOUR SOUND PROFILE
            </span>

            <div className="selected-style-values">
              <span>{mood}</span>
              <span className="style-separator">/</span>
              <span>{genre}</span>
              <span className="style-separator">/</span>
              <span>{instrument}</span>
              <span className="style-separator">/</span>
              <span>{duration} seconds</span>
            </div>
          </div>

          {/* Generate or compare button */}
          <button
            type="button"
            className="generate-button"
            onClick={
              activePage === "generate"
                ? handleGenerate
                : handleCompare
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" />

                {activePage === "generate"
                  ? "Creating your music..."
                  : "Comparing prompts..."}
              </>
            ) : (
              <>
                <Icon
                  name={
                    activePage === "generate"
                      ? "music"
                      : "compare"
                  }
                  size={20}
                />

                {activePage === "generate"
                  ? "Generate Music"
                  : "Compare Prompts"}

                <Icon name="arrow" size={20} />
              </>
            )}
          </button>

          {/* Status and error messages */}
          {result && (
            <div
              className={
                result.toLowerCase().includes("failed")
                  ? "notice error-notice"
                  : "notice"
              }
              role="status"
            >
              {result}
            </div>
          )}
        </section>

        {/* Generated music and studio tips */}
        {activePage === "generate" && (
          <section className="results-grid">
            <div className="results-panel">
              <div className="section-heading">
                <div className="section-title">
                  <span className="section-icon">
                    <Icon name="wave" size={22} />
                  </span>

                  <div>
                    <h2>Your generated music</h2>
                    <p>
                      Your latest creation, ready to listen.
                    </p>
                  </div>
                </div>

                <span className="small-badge">
                  {generatedAudio
                    ? "TRACK READY"
                    : "AWAITING CREATION"}
                </span>
              </div>

              {generatedAudio ? (
                <AudioResult
                  title={`${mood} ${genre} Session`}
                  base64={generatedAudio.base64}
                  mimeType={generatedAudio.mimeType}
                  filename="auralith-generated-music.wav"
                  artwork={mood}
                />
              ) : (
                <div className="empty-player">
                  <div className="empty-artwork">
                    <Icon name="wave" size={46} />
                  </div>

                  <div className="empty-player-copy">
                    <span className="eyebrow">
                      YOUR NEXT CREATION
                    </span>

                    <h3>
                      Something beautiful starts here.
                    </h3>

                    <p>
                      Choose your sound, describe your idea,
                      and generate your first track.
                    </p>
                  </div>

                  <div
                    className="empty-waveform"
                    aria-hidden="true"
                  >
                    {Array.from(
                      { length: 30 },
                      (_, index) => (
                        <span
                          key={index}
                          style={{
                            "--bar-height": `${
                              15 +
                              Math.abs(
                                Math.sin(index * 0.7)
                              ) *
                                75
                            }%`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Studio notes */}
            <aside className="tips-panel">
              <div className="section-title">
                <span className="section-icon">
                  <Icon name="bulb" size={21} />
                </span>

                <div>
                  <h2>Studio notes</h2>
                  <p>Small details make a difference.</p>
                </div>
              </div>

              <ul className="tips-list">
                <li>
                  <span className="tip-check">
                    <Icon name="check" size={13} />
                  </span>

                  Describe the feeling you want your music
                  to evoke.
                </li>

                <li>
                  <span className="tip-check">
                    <Icon name="check" size={13} />
                  </span>

                  Mention specific instruments and musical
                  styles.
                </li>

                <li>
                  <span className="tip-check">
                    <Icon name="check" size={13} />
                  </span>

                  Experiment with different moods and
                  durations.
                </li>

                <li>
                  <span className="tip-check">
                    <Icon name="check" size={13} />
                  </span>

                  Refine your prompt to explore a different
                  sound.
                </li>
              </ul>

              <button
                type="button"
                className="outline-button full-width"
                onClick={() => setShowPrompts(true)}
              >
                Explore example prompts
                <Icon name="arrow" size={16} />
              </button>
            </aside>
          </section>
        )}

        {/* Prompt comparison results */}
        {comparison && (
          <section className="comparison-panel">
            <div className="section-heading">
              <div className="section-title">
                <span className="section-icon">
                  <Icon name="compare" size={21} />
                </span>

                <div>
                  <h2>
                    Prompt enhancement comparison
                  </h2>

                  <p>
                    Compare the two results returned by your
                    backend.
                  </p>
                </div>
              </div>

              <span className="small-badge">
                {comparison.rag_status || "COMPARISON"}
              </span>
            </div>

            <div className="comparison-grid">
              {/* Original prompt */}
              <article className="comparison-card">
                <span className="eyebrow">
                  01 / ORIGINAL
                </span>

                <h3>Standard generation</h3>

                <p className="comparison-prompt">
                  {comparison.original_prompt}
                </p>

                <AudioResult
                  title="Original prompt audio"
                  base64={comparison.original_audio_base64}
                  mimeType="audio/wav"
                  filename="auralith-original.wav"
                  artwork="Calm"
                  subtitle="STANDARD GENERATION"
                />
              </article>

              {/* Enhanced prompt */}
              <article className="comparison-card enhanced-card">
                <span className="eyebrow">
                  02 / ENHANCED
                </span>

                <h3>Enhanced generation</h3>

                <p className="comparison-prompt">
                  {comparison.enhanced_prompt}
                </p>

                <AudioResult
                  title="Enhanced prompt audio"
                  base64={comparison.enhanced_audio_base64}
                  mimeType="audio/wav"
                  filename="auralith-enhanced.wav"
                  artwork="Cinematic"
                  subtitle="ENHANCED GENERATION"
                />
              </article>
            </div>

            <p className="comparison-message">
              {comparison.message}
            </p>

            <p className="helper-text">
              Note: this comparison reflects the functionality
              currently implemented in your backend. Actual
              retrieval-based RAG is not yet connected.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-brand">
            <span className="footer-mark">
              <Icon name="wave" size={17} />
            </span>

            <strong>Auralith</strong>
          </div>

          <p>
            Made for the music in your imagination.
          </p>

          <span className="footer-engine">
            Powered by MusicGen
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;