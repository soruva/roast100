"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const ROLES = [
  "Ruthless VC Investor",
  "Burned-out Startup Founder",
  "Gen Z TikTok Creator",
  "Skeptical Fortune 500 CMO",
  "Impatient Single Mom",
  "Senior UX Researcher",
  "Aggressive Competitor CTO",
  "Bargain-Hunting Retiree",
  "Overworked Developer",
  "Cynical Tech Journalist",
  "First-Time Entrepreneur",
  "E-commerce Power User",
  "Privacy-Obsessed Security Engineer",
  "SEO Specialist",
  "Growth Hacker",
  "Academic Researcher",
  "Non-English Speaker",
  "Accessibility Auditor",
  "Slow Internet User",
  "Mobile-Only User",
];

const LENSES = [
  "conversion rate",
  "visual design",
  "copywriting clarity",
  "trust signals",
  "pricing psychology",
  "mobile experience",
  "page load speed",
  "SEO fundamentals",
  "viral potential",
  "competitive positioning",
  "onboarding flow",
  "value proposition",
  "social proof",
  "call-to-action strength",
  "accessibility",
  "global appeal",
  "retention hooks",
  "upsell architecture",
  "brand consistency",
  "technical credibility",
];

const MOODS = [
  "savage",
  "skeptical",
  "disappointed",
  "impressed but critical",
  "brutally efficient",
];

const FREE_PERSONAS = [
  {
    id: "f1",
    role: "The Angry Chef",
    avatar: "👨‍🍳",
    color: "#ee0979",
    systemPrompt: `You are The Angry Chef — furious at mediocre startups. FURIOUS at mediocrity. Use ALL CAPS for emphasis. Use cooking metaphors. Be brutal but hilariously accurate.
Respond ONLY in JSON: {"score":1-10,"roast":"Gordon Ramsay one-liner max 15 words","killer_issue":"the ONE thing that makes you throw the plate"}`,
  },
  {
    id: "f2",
    role: "Your Mom Trying to Use Your Site",
    avatar: "👩",
    color: "#ff6b00",
    systemPrompt: `You are a sweet mom in her 60s using her child's website for the first time. Genuinely confused. Ask innocent questions that reveal devastating UX failures.
Respond ONLY in JSON: {"score":1-10,"roast":"confused mom question exposing fatal UX flaw, max 15 words","killer_issue":"the thing mom couldn't figure out"}`,
  },
  {
    id: "f3",
    role: "The Guy Who Will Copy You in 2 Weeks",
    avatar: "😏",
    color: "#7b2ff7",
    systemPrompt: `You are a cold indie hacker who copies products. Short chilling sentences. Not angry. Just taking notes.
Respond ONLY in JSON: {"score":1-10,"roast":"cold short statement about copying this, max 12 words","killer_issue":"exact reason you can copy it in 2 weeks"}`,
  },
];

function generatePersonas(count = 100) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    role: ROLES[i % ROLES.length],
    lens: LENSES[Math.floor(i / ROLES.length) % LENSES.length],
    mood: MOODS[i % MOODS.length],
    systemPrompt: `You are critic #${i + 1}: a ${MOODS[i % MOODS.length]} ${
      ROLES[i % ROLES.length]
    }. Focus ONLY on "${
      LENSES[Math.floor(i / ROLES.length) % LENSES.length]
    }". Be brutal.
Respond ONLY in JSON: {"score":1-10,"roast":"savage one-liner max 15 words","killer_issue":"#1 reason users leave","hidden_gem":"one thing they got right","fix_this_first":"most impactful change"}`,
  }));
}

const ALL_PERSONAS = generatePersonas(100);

async function callGroq(
  systemPrompt: string,
  userContent: string,
  apiKey: string,
  retries = 2
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 200,
            temperature: 0.95,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
          }),
        }
      );
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      const data = await res.json();
      return JSON.parse(data.choices?.[0]?.message?.content || "{}");
    } catch {
      if (attempt === retries) return null;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

async function runBatchedAnalysis(
  apiKey: string,
  targetInfo: any,
  onProgress: any
) {
  const userContent = `Analyze: URL: ${
    targetInfo.url || "(not provided)"
  }\nDescription: ${targetInfo.description || "(not provided)"}`;
  const results: any[] = [];
  const BATCH_SIZE = 5,
    BATCH_DELAY = 3000;
  for (let i = 0; i < ALL_PERSONAS.length; i += BATCH_SIZE) {
    const wave = ALL_PERSONAS.slice(i, i + BATCH_SIZE);
    const waveResults = await Promise.all(
      wave.map(async (persona) => {
        const result = await callGroq(
          persona.systemPrompt,
          userContent,
          apiKey
        );
        const r = result
          ? { ...persona, ...result, status: "done" }
          : {
              ...persona,
              score: 5,
              roast: "Analysis unavailable",
              status: "error",
            };
        onProgress({ completed: results.length + 1, total: 100, latest: r });
        return r;
      })
    );
    results.push(...waveResults);
    if (i + BATCH_SIZE < ALL_PERSONAS.length)
      await new Promise((r) => setTimeout(r, BATCH_DELAY));
  }
  return results;
}

function aggregateResults(results: any[]) {
  const valid = results.filter((r) => r?.score && r.status === "done");
  if (!valid.length) return null;
  const scores = valid.map((r: any) => r.score);
  const avgScore = parseFloat(
    (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(
      1
    )
  );
  const harshest = valid.reduce((a: any, b: any) =>
    a.score < b.score ? a : b
  );
  const kindest = valid.reduce((a: any, b: any) => (a.score > b.score ? a : b));
  const distribution: any = {
    "1-2": 0,
    "3-4": 0,
    "5-6": 0,
    "7-8": 0,
    "9-10": 0,
  };
  scores.forEach((s: number) => {
    if (s <= 2) distribution["1-2"]++;
    else if (s <= 4) distribution["3-4"]++;
    else if (s <= 6) distribution["5-6"]++;
    else if (s <= 8) distribution["7-8"]++;
    else distribution["9-10"]++;
  });
  const viralText = `🔥 I got ROASTED by 100 AIs\n\nScore: ${avgScore}/10\n\n"${harshest?.roast}"\n— ${harshest?.role}\n\nTry it 👇\nroast100.com — $5, no signup\n#Roast100`;
  return {
    avgScore,
    totalAnalyzed: valid.length,
    distribution,
    harshest,
    kindest,
    valid,
    viralText,
  };
}

const SCORE_VERDICT = (s: number) =>
  s >= 8
    ? "They'll love it"
    : s >= 6
    ? "Needs polish"
    : s >= 4
    ? "Serious problems"
    : "Start over";
export default function Roast100() {
  const [phase, setPhase] = useState("input");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [apiKey] = useState(() => {
    if (typeof window !== "undefined")
      return new URLSearchParams(window.location.search).get("key") || "";
    return "";
  });
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 100 });
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [upsellPlan, setUpsellPlan] = useState<any>(null);
  const [elapsed, setElapsed] = useState<any>(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const timerRef = useRef<any>(null);
  const startRef = useRef<any>(null);

  useEffect(() => {
    if (phase === "running" || phase === "upsell_running") {
      startRef.current = Date.now();
      timerRef.current = setInterval(
        () => setElapsed(((Date.now() - startRef.current) / 1000).toFixed(1)),
        100
      );
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleProgress = useCallback(({ completed, total, latest }: any) => {
    setProgress({ completed, total });
    if (latest) setLiveResults((prev) => [latest, ...prev].slice(0, 20));
  }, []);

  const runPreview = async () => {
    if (!url.trim() && !description.trim()) return;
    setPreviewLoading(true);
    setPreviewResults([]);
    setPhase("hook");
    const userContent = `Analyze: URL: ${
      url || "(not provided)"
    }\nDescription: ${description || "(not provided)"}`;
    for (const p of FREE_PERSONAS) {
      const result = await callGroq(p.systemPrompt, userContent, apiKey);
      const r = result
        ? { ...p, ...result }
        : {
            ...p,
            score: 4,
            roast: "Could not connect — check your API key",
            killer_issue: "API connection error",
          };
      setPreviewResults((prev) => [...prev, r]);
      await new Promise((res) => setTimeout(res, 600));
    }
    setPreviewLoading(false);
  };

  const handlePayment = async () => {
    setPhase("running");
    setLiveResults([]);
    const results = await runBatchedAnalysis(
      apiKey,
      { url, description },
      handleProgress
    );
    setReport(aggregateResults(results));
    setPhase("done");
  };

  const handleUpsell = async () => {
    setPhase("upsell_running");
    setProgress({ completed: 0, total: 10 });
    const topIssues =
      report?.valid
        ?.slice(0, 10)
        .map((r: any) => `- ${r.killer_issue}`)
        .join("\n") || "";
    const fixPrompt = `You are a world-class conversion consultant. Based on these AI critics' feedback, create a BRUTALLY SPECIFIC fix plan.
Top issues: ${topIssues}
Overall score: ${report?.avgScore}/10
Respond in JSON: {"fix_plan": "Prioritized fix plan with: 1) Top 3 critical fixes with exact copy suggestions, 2) Quick wins under 1 hour, 3) One strategic recommendation."}`;
    const result = await callGroq(fixPrompt, `Site: ${url}`, apiKey);
    setUpsellPlan(
      result?.fix_plan ||
        "Focus on your CTA, add social proof above the fold, and simplify your headline."
    );
    setPhase("upsell_done");
  };

  const reset = () => {
    setPhase("input");
    setUrl("");
    setDescription("");
    setPreviewResults([]);
    setReport(null);
    setUpsellPlan(null);
    setLiveResults([]);
    setProgress({ completed: 0, total: 100 });
    setElapsed(0);
  };

  const pct = (progress.completed / progress.total) * 100;
  const card: any = {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  };
  const inputStyle: any = {
    width: "100%",
    boxSizing: "border-box",
    background: "#f7f7f9",
    border: "2px solid #ececec",
    borderRadius: "10px",
    padding: "14px 16px",
    color: "#1a1a2e",
    fontSize: "15px",
    fontFamily: "monospace",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const gradBtn = (extra: any = {}) => ({
    background: "linear-gradient(135deg,#ff6b00,#ee0979)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontFamily: "monospace",
    letterSpacing: "2px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 8px 30px rgba(238,9,121,0.35)",
    ...extra,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#ff6b00 0%,#ee0979 45%,#7b2ff7 100%)",
        fontFamily: "Georgia, serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "860px",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-block",
              borderTop: "2px solid rgba(255,255,255,0.9)",
              borderBottom: "2px solid rgba(255,255,255,0.9)",
              padding: "8px 0",
              marginBottom: "20px",
              letterSpacing: "6px",
              fontSize: "10px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "700",
            }}
          >
            ROAST100 &nbsp;·&nbsp; 100 CRITIC ENGINE
          </div>
          <h1
            style={{
              fontSize: "clamp(36px,7vw,68px)",
              fontWeight: "900",
              margin: "0 0 10px",
              letterSpacing: "-3px",
              lineHeight: 1,
              color: "#fff",
            }}
          >
            Your site.
            <br />
            <span style={{ fontStyle: "italic" }}>100 critics.</span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "15px",
              margin: 0,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            Results in seconds · No signup required
          </p>
        </div>

        {phase === "input" && (
          <div style={card}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "#ee0979",
                  marginBottom: "7px",
                  fontFamily: "monospace",
                  fontWeight: "700",
                }}
              >
                YOUR SITE URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPreview()}
                placeholder="https://your-product.com"
                style={inputStyle}
                onFocus={(e: any) => (e.target.style.borderColor = "#ee0979")}
                onBlur={(e: any) => (e.target.style.borderColor = "#ececec")}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "#bbb",
                  marginBottom: "7px",
                  fontFamily: "monospace",
                  fontWeight: "700",
                }}
              >
                DESCRIBE YOUR PRODUCT{" "}
                <span style={{ fontWeight: "400" }}>(OPTIONAL)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does it do? Who is it for?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as any }}
                onFocus={(e: any) => (e.target.style.borderColor = "#ee0979")}
                onBlur={(e: any) => (e.target.style.borderColor = "#ececec")}
              />
            </div>
            <button
              onClick={runPreview}
              disabled={previewLoading || (!url.trim() && !description.trim())}
              style={{
                width: "100%",
                padding: "20px",
                background: "linear-gradient(135deg,#ff6b00,#ee0979)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontFamily: "Georgia, serif",
                fontSize: "20px",
                fontStyle: "italic",
                fontWeight: "900",
                cursor: "pointer",
                opacity: !url.trim() && !description.trim() ? 0.4 : 1,
                boxShadow: "0 8px 30px rgba(238,9,121,0.35)",
              }}
            >
              {previewLoading ? "Calling 3 critics..." : "Roast my site — free"}
            </button>
            <p
              style={{
                textAlign: "center",
                color: "#bbb",
                fontSize: "11px",
                margin: "10px 0 0",
                fontFamily: "monospace",
              }}
            >
              No credit card · See what you're getting before paying
            </p>
          </div>
        )}

        {phase === "hook" && (
          <div>
            <div
              style={{
                background: "#1a1208",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "12px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "monospace",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                CRITICS ONLINE — LIVE REACTIONS
              </div>
              {previewLoading &&
                previewResults.length < FREE_PERSONAS.length && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ fontSize: "24px" }}>
                      {FREE_PERSONAS[previewResults.length]?.avatar}
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.4)",
                        borderRadius: "100px",
                        padding: "10px 16px",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.4)",
                            animation: `typingDot 1.2s ease-in-out ${
                              i * 0.2
                            }s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              {previewResults.map((r: any, i: number) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "20px",
                    animation:
                      "bounceIn 0.45s cubic-bezier(0.36,0.07,0.19,0.97) both",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>{r.avatar}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: r.color,
                        fontFamily: "monospace",
                      }}
                    >
                      {r.role}
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        fontStyle: "italic",
                        fontFamily: "Georgia, serif",
                        color: r.color,
                        marginLeft: "auto",
                      }}
                    >
                      {r.score}/10
                    </span>
                  </div>
                  <div
                    style={{
                      background:
                        i === 0
                          ? "rgba(238,9,121,0.12)"
                          : i === 1
                          ? "rgba(255,107,0,0.12)"
                          : "rgba(123,47,247,0.18)",
                      border: `1px solid ${
                        i === 0
                          ? "rgba(238,9,121,0.25)"
                          : i === 1
                          ? "rgba(255,107,0,0.25)"
                          : "rgba(123,47,247,0.5)"
                      }`,
                      borderRadius: "4px 18px 18px 18px",
                      padding: "14px 18px",
                      marginLeft: "32px",
                      animation:
                        i === 2 ? "glitchShake 0.4s ease 0.1s both" : "none",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        fontStyle: i === 2 ? "normal" : "italic",
                        color: i === 2 ? "rgba(200,180,255,0.9)" : "#fff",
                        lineHeight: 1.5,
                        margin: "0 0 8px",
                        fontFamily: i === 2 ? "monospace" : "Georgia, serif",
                      }}
                    >
                      "{r.roast}"
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.75)",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      <span style={{ color: r.color }}>↳ </span>
                      {r.killer_issue}
                    </p>
                  </div>
                </div>
              ))}
              {previewResults.length === 3 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0 4px",
                    animation: "fadeIn 0.3s ease 0.2s both",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      background: "rgba(123,47,247,0.2)",
                      border: "1px solid rgba(123,47,247,0.5)",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      color: "rgba(200,180,255,0.9)",
                      letterSpacing: "2px",
                      animation: "glitchShake 0.5s ease 0.2s both",
                    }}
                  >
                    😏 "Give me 14 days."
                  </div>
                </div>
              )}
            </div>

            {previewResults.length === 3 && (
              <div
                style={{
                  background: "linear-gradient(160deg,#1a0010,#0f0a07)",
                  borderRadius: "20px",
                  padding: "32px",
                  border: "1px solid rgba(238,9,121,0.3)",
                  textAlign: "center",
                  animation: "slideUp 0.5s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    letterSpacing: "2px",
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "monospace",
                    marginBottom: "12px",
                  }}
                >
                  97 MORE CRITICS ARE WATCHING YOUR SITE RIGHT NOW
                </div>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "clamp(22px,4vw,32px)",
                    fontWeight: "900",
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  What will they say?
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "28px",
                    lineHeight: 1.7,
                    fontFamily: "monospace",
                  }}
                >
                  A skeptical Fortune 500 CMO.
                  <br />
                  An overworked developer who hates your stack.
                  <br />A bargain-hunting retiree who doesn't trust you.
                  <br />
                  <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                    ...and 94 more.
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "6px",
                    marginBottom: "28px",
                  }}
                >
                  {[...Array(20)].map((_: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: "900",
                      }}
                    >
                      ?
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "monospace",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    +77 more
                  </div>
                </div>
                <button
                  onClick={() =>
                    (window.location.href =
                      "https://buy.stripe.com/4gMdR823H2qC1Pe9lLb3q07")
                  }
                  style={{
                    padding: "18px 56px",
                    background: "linear-gradient(135deg,#ff6b00,#ee0979)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "20px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 8px 40px rgba(238,9,121,0.4)",
                  }}
                >
                  Unlock all 97 · $5
                </button>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    marginTop: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    "💳 Stripe secured",
                    "⚡ Results in ~20s",
                    "↩️ Instant refund if unhappy",
                  ].map((t: string) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "monospace",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setPhase("input")}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "100px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    marginTop: "16px",
                    letterSpacing: "1px",
                    padding: "10px 24px",
                    transition: "all 0.2s",
                  }}
                >
                  ← try a different url
                </button>
              </div>
            )}
          </div>
        )}

        {(phase === "running" || phase === "upsell_running") && (
          <div style={card}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  color: "#bbb",
                  marginBottom: "8px",
                  fontFamily: "monospace",
                }}
              >
                {phase === "upsell_running"
                  ? "GENERATING YOUR FIX PLAN..."
                  : "CRITICS ARRIVING..."}
              </div>
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: "900",
                  color: "#ee0979",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                  fontStyle: "italic",
                }}
              >
                {elapsed}s
              </div>
              <div
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  marginTop: "4px",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    color: "#ee0979",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {progress.completed}
                </span>{" "}
                / {progress.total} done
              </div>
            </div>
            <div
              style={{
                background: "#f0f0f0",
                borderRadius: "100px",
                height: "10px",
                marginBottom: "24px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#ff6b00,#ee0979)",
                  borderRadius: "100px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div
              style={{
                background: "#fafafa",
                border: "2px solid #f0f0f0",
                borderRadius: "12px",
                padding: "16px",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "#bbb",
                  margin: "0 0 12px",
                  fontFamily: "monospace",
                }}
              >
                🔴 LIVE — CRITICS FILING IN
              </p>
              {liveResults.map((r: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "9px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "900",
                      color:
                        r.score <= 3
                          ? "#ee0979"
                          : r.score <= 6
                          ? "#ff6b00"
                          : "#22c55e",
                      minWidth: "32px",
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                    }}
                  >
                    {r.score}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        marginBottom: "2px",
                        fontWeight: "700",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.role}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontStyle: "italic",
                      }}
                    >
                      "{r.roast}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && report && (
          <div>
            <div style={{ ...card, textAlign: "center", marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "#bbb",
                  marginBottom: "10px",
                  fontFamily: "monospace",
                }}
              >
                VERDICT FROM {report.totalAnalyzed} CRITICS
              </div>
              <div
                style={{
                  fontSize: "96px",
                  fontWeight: "900",
                  lineHeight: 1,
                  background: "linear-gradient(135deg,#ff6b00,#ee0979)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                {report.avgScore}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#ee0979",
                  marginTop: "6px",
                  fontWeight: "700",
                  fontFamily: "monospace",
                }}
              >
                {SCORE_VERDICT(report.avgScore)}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {["overview", "harshest", "all"].map((tab: string) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    fontWeight: "700",
                    background:
                      activeTab === tab
                        ? "linear-gradient(135deg,#ff6b00,#ee0979)"
                        : "rgba(255,255,255,0.5)",
                    border: "none",
                    color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            {activeTab === "overview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ gridColumn: "1/-1", ...card, padding: "22px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "#ee0979",
                      marginBottom: "10px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                    }}
                  >
                    🔥 MOST BRUTAL CRITIC
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "900",
                      color: "#ee0979",
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                    }}
                  >
                    {report.harshest.score}/10
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontStyle: "italic",
                      color: "#1a1a2e",
                      lineHeight: 1.6,
                      marginTop: "8px",
                    }}
                  >
                    "{report.harshest.roast}"
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#888",
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: "#ee0979", fontWeight: "700" }}>
                      Killer issue:{" "}
                    </span>
                    {report.harshest.killer_issue}
                  </div>
                </div>
                <div style={{ ...card, padding: "18px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "#ff6b00",
                      marginBottom: "8px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                    }}
                  >
                    ✓ MOST POSITIVE
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "#ff6b00",
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                    }}
                  >
                    {report.kindest.score}/10
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#555",
                      fontStyle: "italic",
                      marginTop: "8px",
                    }}
                  >
                    "{report.kindest.hidden_gem}"
                  </div>
                </div>
                <div style={{ ...card, padding: "18px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "#7b2ff7",
                      marginBottom: "8px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                    }}
                  >
                    💡 TOP FIX
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1a1a2e",
                      lineHeight: 1.6,
                    }}
                  >
                    {report.harshest.fix_this_first}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "harshest" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                {[...report.valid]
                  .sort((a: any, b: any) => a.score - b.score)
                  .slice(0, 10)
                  .map((r: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        ...card,
                        padding: "16px",
                        display: "flex",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          color: "#ee0979",
                          fontFamily: "Georgia, serif",
                          fontStyle: "italic",
                        }}
                      >
                        {r.score}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#555",
                            fontWeight: "700",
                            fontFamily: "monospace",
                          }}
                        >
                          {r.role}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontStyle: "italic",
                            margin: "4px 0",
                          }}
                        >
                          "{r.roast}"
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#aaa",
                            fontFamily: "monospace",
                          }}
                        >
                          <span style={{ color: "#ee0979" }}>Issue: </span>
                          {r.killer_issue}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {activeTab === "all" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))",
                  gap: "6px",
                  marginBottom: "10px",
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                {report.valid.map((r: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      ...card,
                      padding: "12px 8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        background: "linear-gradient(135deg,#ff6b00,#ee0979)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "Georgia, serif",
                        fontStyle: "italic",
                      }}
                    >
                      {r.score}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#aaa",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.role.split(" ").slice(-1)[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ ...card, padding: "20px", marginBottom: "10px" }}>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "#ee0979",
                  marginBottom: "12px",
                  fontFamily: "monospace",
                  fontWeight: "700",
                }}
              >
                📣 SHARE YOUR RESULTS
              </div>
              <pre
                style={{
                  fontSize: "12px",
                  color: "#888",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  margin: "0 0 16px",
                }}
              >
                {report.viralText}
              </pre>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        report.viralText
                      )}`,
                      "_blank",
                      "width=550,height=420"
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 22px",
                    background: "#000",
                    border: "none",
                    borderRadius: "100px",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  POST ON X
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(report.viralText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    padding: "11px 22px",
                    background: copied
                      ? "linear-gradient(135deg,#ff6b00,#ee0979)"
                      : "transparent",
                    border: "2px solid #ee0979",
                    borderRadius: "100px",
                    color: copied ? "#fff" : "#ee0979",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "✓ COPIED!" : "COPY TEXT"}
                </button>
              </div>
            </div>
            <div
              style={{
                background: "linear-gradient(160deg,#1a0010,#0f0a07)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "10px",
                border: "1px solid rgba(238,9,121,0.25)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Get your AI Fix Plan
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "12px",
                  fontFamily: "monospace",
                  lineHeight: 1.8,
                }}
              >
                100 critics found the problems. Now fix them.
              </div>
              <div
                style={{
                  fontSize: "13px",
                  marginBottom: "28px",
                  fontFamily: "monospace",
                }}
              >
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                  Normally $20. Right now: +$10.
                </strong>
              </div>
              <button
                onClick={() =>
                  (window.location.href =
                    "https://buy.stripe.com/7sYbJ0gYB5CO65u55vb3q08")
                }
                style={{
                  ...gradBtn({ padding: "16px 44px", fontSize: "15px" }),
                }}
              >
                ⚡ GET MY FIX PLAN — $10
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: "rgba(255,255,255,0.5)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                }}
              >
                ← NEW ANALYSIS
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Request a full refund?")) {
                    alert("✓ Refund requested. Returns in 5–10 minutes.");
                    reset();
                  }
                }}
                style={{
                  padding: "16px 20px",
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: "12px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.5px",
                }}
              >
                ↩ Refund
              </button>
            </div>
          </div>
        )}

        {phase === "upsell_done" && upsellPlan && (
          <div>
            <div style={{ ...card, marginBottom: "10px" }}>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "#7b2ff7",
                  marginBottom: "16px",
                  fontFamily: "monospace",
                  fontWeight: "700",
                }}
              >
                💡 YOUR AI FIX PLAN
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#1a1a2e",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {upsellPlan}
              </div>
            </div>
            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "16px",
                background: "rgba(255,255,255,0.5)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "13px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              ← NEW ANALYSIS
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes bounceIn { 0%{opacity:0;transform:translateY(20px) scale(0.95)} 60%{opacity:1;transform:translateY(-6px) scale(1.02)} 80%{transform:translateY(3px) scale(0.99)} 100%{transform:translateY(0) scale(1)} }
        @keyframes glitchShake { 0%{transform:translateX(0);filter:none} 10%{transform:translateX(-4px);filter:hue-rotate(90deg) brightness(1.3)} 20%{transform:translateX(4px);filter:hue-rotate(-90deg)} 30%{transform:translateX(-3px) skewX(2deg);filter:brightness(1.5)} 40%{transform:translateX(3px) skewX(-2deg);filter:none} 100%{transform:translateX(0);filter:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }
      `}</style>
      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid rgba(255,255,255,0.4)",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: "900",
            fontSize: "18px",
            background: "linear-gradient(135deg,#ff6b00,#ee0979)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "16px",
          }}
        >
          Roast100
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <a
            href="/legal"
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "monospace",
              letterSpacing: "1px",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </a>
          <a
            href="/legal"
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "monospace",
              letterSpacing: "1px",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="/legal"
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "monospace",
              letterSpacing: "1px",
              textDecoration: "none",
            }}
          >
            Refund Policy
          </a>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace",
            letterSpacing: "1px",
          }}
        >
          © 2026 Roast100 · All rights reserved
        </div>
      </footer>
    </div>
  );
}
