import { useState, useRef } from "react";
import { ArrowLeftRight, Copy, Check, Volume2, Loader2, Languages } from "lucide-react";
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
];
export default function TranslationTool() {

  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ar");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);



  const translate = async () => {
    const text = inputText.trim();
    if (!text) {
      setOutputText("");
      return;
    }
    if (sourceLang === targetLang) {
      setError("Source and tareget are the Same");
      return;
    }


    setLoading(true);
    setError("");

    try {
      const url =
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=" +
        sourceLang +
        "|" +
        targetLang;



      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      if (data.responseStatus !== 200 && data.responseStatus !== "200") {
        throw new Error(data.responseDetails || "Translation failed");
      }
      setOutputText(data.responseData.translatedText);
    } catch (err) {
      setError("Couldn't translate. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    // Auto-translate after the user stops typing for 700ms.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) translate();
    }, 700);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyOutput = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = (text, lang) => {
    if (!text || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="tt-app">
      <style>{CSS}</style>

      <header className="tt-head">
        <div className="tt-brand">
          <span className="tt-logo" aria-hidden="true">
            <Languages size={24} strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="tt-wordmark">Passage</h1>
            <p className="tt-tag">Move meaning from one language to the next.</p>
          </div>
        </div>
      </header>

      <main className="tt-panel">
        {/* ---- FROM ---- */}
        <section className="tt-pane tt-pane--from">
          <div className="tt-pane-top">
            <span className="tt-role">From</span>
            <div className="tt-langpick">
              <select
                className="tt-select"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                aria-label="Source language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span className="tt-code">{sourceLang}</span>
            </div>
          </div>

          <textarea
            className="tt-input"
            value={inputText}
            onChange={handleInputChange}
            maxLength={500}
            placeholder="Type or paste text here…"
            aria-label="Text to translate"
          />

          <div className="tt-pane-foot">
            <span className="tt-count">{inputText.length}/500</span>
            <div className="tt-acts">
              <button
                type="button"
                className="tt-iconbtn"
                onClick={() => speak(inputText, sourceLang)}
                disabled={!inputText}
                title="Read aloud"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ---- INTERCHANGE ---- */}
        <div className="tt-seam">
          <button
            type="button"
            className="tt-swap"
            onClick={swapLanguages}
            title="Swap languages"
            aria-label="Swap languages"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>

        {/* ---- TO ---- */}
        <section className="tt-pane tt-pane--to">
          <div className="tt-pane-top">
            <span className="tt-role">To</span>
            <div className="tt-langpick">
              <select
                className="tt-select"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                aria-label="Target language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span className="tt-code">{targetLang}</span>
            </div>
          </div>

          <div className="tt-output" aria-live="polite">
            {loading ? (
              <div className="tt-loading">
                <Loader2 size={18} className="tt-spin" />
                <span>Translating…</span>
              </div>
            ) : outputText ? (
              <p className="tt-result">{outputText}</p>
            ) : (
              <span className="tt-placeholder">Translation appears here.</span>
            )}
          </div>

          <div className="tt-pane-foot">
            <span className="tt-count" />
            <div className="tt-acts">
              <button
                type="button"
                className="tt-iconbtn"
                onClick={() => speak(outputText, targetLang)}
                disabled={!outputText}
                title="Read aloud"
              >
                <Volume2 size={16} />
              </button>
              <button
                type="button"
                className="tt-iconbtn"
                onClick={copyOutput}
                disabled={!outputText}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {error && <div className="tt-error">{error}</div>}

      <div className="tt-cta-row">
        <button
          type="button"
          className="tt-translate"
          onClick={translate}
          disabled={loading || !inputText.trim()}
        >
          {loading ? <Loader2 size={18} className="tt-spin" /> : null}
          Translate
        </button>
      </div>

      <footer className="tt-foot">
        Translations by MyMemory · 500-character limit per request
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.tt-app{
    --ink:#141A2E; --ink-soft:#5A6175;
    --paper:#EAEBF0; --surface:#FFFFFF;
    --cool:#3B6EA5; --cool-tint:#EAF1F8;
    --warm:#C25A2B; --warm-tint:#FBEDE2;
    --line:#DEE0E7;
    min-height:100vh;
    box-sizing:border-box;
    padding:48px 20px 56px;
    display:flex; flex-direction:column; align-items:center;
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    color:var(--ink);
    background:
        radial-gradient(120% 80% at 0% 0%, var(--cool-tint), transparent 55%),
        radial-gradient(120% 80% at 100% 100%, var(--warm-tint), transparent 55%),
        var(--paper);
}
.tt-app *{ box-sizing:border-box; }
.tt-app :focus-visible{ outline:2px solid var(--cool); outline-offset:2px; }

.tt-head{ width:100%; max-width:760px; margin-bottom:26px; }
.tt-brand{ display:flex; align-items:center; gap:14px; }
.tt-logo{
    width:48px; height:48px; flex:none; border-radius:15px;
    background:var(--ink); color:#fff; display:grid; place-items:center;
}
.tt-wordmark{
    margin:0; font-family:'Fraunces',Georgia,serif;
    font-weight:600; font-size:30px; letter-spacing:-0.01em;
}
.tt-tag{ margin:3px 0 0; color:var(--ink-soft); font-size:14px; }

.tt-panel{ width:100%; max-width:760px; display:flex; flex-direction:column; gap:16px; }

.tt-pane{
    background:var(--surface); border:1px solid var(--line); border-radius:20px;
    overflow:hidden;
    box-shadow:0 1px 0 rgba(20,26,46,.02), 0 22px 44px -30px rgba(20,26,46,.35);
}
.tt-pane-top{
    display:flex; align-items:center; justify-content:space-between;
    padding:13px 18px; border-bottom:1px solid var(--line);
}
.tt-pane--from .tt-pane-top{ background:var(--cool-tint); }
.tt-pane--to .tt-pane-top{ background:var(--warm-tint); }

.tt-role{
    font-family:'Space Mono',monospace; text-transform:uppercase;
    letter-spacing:.18em; font-size:11px; color:var(--ink-soft);
}
.tt-pane--from .tt-role{ color:var(--cool); }
.tt-pane--to .tt-role{ color:var(--warm); }

.tt-langpick{ display:flex; align-items:center; gap:10px; }
.tt-select{
    appearance:none; -webkit-appearance:none;
    border:1px solid var(--line); background:var(--surface);
    border-radius:999px; padding:7px 32px 7px 15px;
    font-family:inherit; font-size:14px; font-weight:500; color:var(--ink);
    cursor:pointer;
    background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%235A6175" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
    background-repeat:no-repeat; background-position:right 12px center;
}
.tt-code{
    font-family:'Space Mono',monospace; font-weight:700; font-size:12px;
    text-transform:uppercase; color:var(--ink);
    border:1px dashed var(--line); border-radius:8px; padding:4px 8px;
}

.tt-input, .tt-output{
    min-height:158px; padding:22px 20px;
    font-family:'Fraunces',Georgia,serif; font-size:20px; line-height:1.55;
    color:var(--ink);
}
.tt-input{
    width:100%; border:0; outline:0; resize:vertical; background:transparent;
    display:block;
}
.tt-input::placeholder{ color:#9aa0b0; }
.tt-result{ margin:0; }
.tt-placeholder{ color:#9aa0b0; font-family:'Inter',sans-serif; font-size:15px; }
.tt-loading{ display:flex; align-items:center; gap:10px; color:var(--ink-soft); font-family:'Inter',sans-serif; font-size:15px; }

.tt-pane-foot{
    display:flex; align-items:center; justify-content:space-between;
    padding:9px 12px; border-top:1px solid var(--line);
}
.tt-count{ font-family:'Space Mono',monospace; font-size:12px; color:var(--ink-soft); }
.tt-acts{ display:flex; gap:4px; }
.tt-iconbtn{
    display:inline-flex; align-items:center; gap:6px;
    border:1px solid transparent; background:transparent; border-radius:10px;
    padding:8px 11px; font-family:inherit; font-size:13px; color:var(--ink-soft);
    cursor:pointer; transition:background .15s, color .15s;
}
.tt-iconbtn:hover:not(:disabled){ background:#F1F2F6; color:var(--ink); }
.tt-iconbtn:disabled{ opacity:.4; cursor:not-allowed; }

.tt-seam{ display:flex; justify-content:center; margin:-30px 0; position:relative; z-index:3; pointer-events:none; }
.tt-swap{
    pointer-events:auto; width:54px; height:54px; border-radius:50%;
    border:1px solid var(--line); background:var(--surface); color:var(--ink);
    display:grid; place-items:center; cursor:pointer;
    box-shadow:0 12px 26px -10px rgba(20,26,46,.45);
    transition:transform .2s, box-shadow .2s;
}
.tt-swap:hover{ transform:rotate(180deg) translateY(1px); box-shadow:0 16px 30px -10px rgba(20,26,46,.55); }
.tt-swap svg{ transition:transform .35s cubic-bezier(.4,0,.2,1); }

.tt-error{
    width:100%; max-width:760px; margin:16px 0 0;
    background:#FCEBE9; border:1px solid #F2C7C1; color:#9B2C20;
    border-radius:12px; padding:12px 16px; font-size:14px;
}

.tt-cta-row{ display:flex; justify-content:center; margin-top:22px; }
.tt-translate{
    display:inline-flex; align-items:center; gap:10px;
    background:var(--warm); color:#fff; border:0; border-radius:999px;
    padding:14px 32px; font-family:inherit; font-weight:600; font-size:15px;
    cursor:pointer; box-shadow:0 14px 28px -12px rgba(194,90,43,.7);
    transition:transform .15s, background .15s, opacity .15s, box-shadow .15s;
}
.tt-translate:hover:not(:disabled){ transform:translateY(-1px); background:#B14F23; }
.tt-translate:disabled{ opacity:.45; cursor:not-allowed; box-shadow:none; }

.tt-foot{
    margin-top:30px; font-family:'Space Mono',monospace;
    font-size:11px; letter-spacing:.04em; color:var(--ink-soft); text-align:center;
}

.tt-spin{ animation:tt-rot 1s linear infinite; }
@keyframes tt-rot{ to{ transform:rotate(360deg); } }

@media (max-width:520px){
    .tt-app{ padding:32px 14px 44px; }
    .tt-wordmark{ font-size:26px; }
    .tt-input, .tt-output{ font-size:18px; min-height:130px; padding:18px 16px; }
}

@media (prefers-reduced-motion: reduce){
    .tt-app *{ animation-duration:.001ms !important; transition-duration:.001ms !important; }
}
`;
