const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY;
const REPORTS_DIR = "reports";

// ── helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0];
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Polymarket API ────────────────────────────────────────────────────────────

async function fetchAIMarkets() {
  try {
    const url =
      "https://gamma-api.polymarket.com/markets?closed=false&limit=50&order=volume24hr&ascending=false";
    const res = await fetch(url);
    const data = await res.json();

    const keywords = [
      "AI", "GPT", "Claude", "Gemini", "OpenAI", "Anthropic", "Google",
      "artificial intelligence", "machine learning", "LLM", "AGI",
      "Grok", "Meta AI", "regulation", "model", "benchmark"
    ];

    const aiMarkets = data.filter((m) => {
      const text = (m.question || m.title || "").toLowerCase();
      return keywords.some((k) => text.toLowerCase().includes(k.toLowerCase()));
    });

    return aiMarkets.slice(0, 10).map((m) => ({
      question: m.question || m.title || "Unknown",
      probability: m.outcomePrices
        ? Math.round(parseFloat(JSON.parse(m.outcomePrices)[0]) * 100)
        : null,
      volume24h: m.volume24hr ? parseFloat(m.volume24hr).toFixed(0) : "0",
      totalVolume: m.volume ? parseFloat(m.volume).toFixed(0) : "0",
      endDate: m.endDate ? m.endDate.split("T")[0] : "N/A",
      url: m.slug ? `https://polymarket.com/event/${m.slug}` : "#",
    }));
  } catch (err) {
    console.error("Polymarket fetch error:", err.message);
    return [];
  }
}

// ── detect big movers (>10% swing) ───────────────────────────────────────────

function detectAlerts(markets) {
  const yesterday = path.join(
    REPORTS_DIR,
    `${getPreviousDate()}-report.json`
  );
  if (!fs.existsSync(yesterday)) return [];

  const prev = JSON.parse(fs.readFileSync(yesterday, "utf8")).markets || [];
  const alerts = [];

  markets.forEach((m) => {
    const old = prev.find((p) => p.question === m.question);
    if (old && old.probability !== null && m.probability !== null) {
      const delta = m.probability - old.probability;
      if (Math.abs(delta) >= 10) {
        alerts.push({ question: m.question, delta, now: m.probability });
      }
    }
  });

  return alerts;
}

function getPreviousDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ── OpenRouter AI analysis ────────────────────────────────────────────────────

async function generateInsight(markets, alerts, lang = "en") {
  const langInstruction =
    lang === "ru"
      ? "Respond entirely in Russian. Use clear, professional Russian."
      : "Respond entirely in English.";

  const alertBlock =
    alerts.length > 0
      ? `\nSIGNIFICANT MOVES (>10%):\n${alerts
          .map(
            (a) =>
              `- "${a.question}": ${a.delta > 0 ? "+" : ""}${a.delta}pp → now ${a.now}%`
          )
          .join("\n")}`
      : "";

  const marketList = markets
    .map(
      (m, i) =>
        `${i + 1}. "${m.question}" — ${m.probability ?? "?"}% | 24h vol: $${m.volume24h} | closes: ${m.endDate}`
    )
    .join("\n");

  const prompt = `${langInstruction}

You are an AI market analyst. Today is ${today()}.

TOP AI PREDICTION MARKETS ON POLYMARKET:
${marketList}
${alertBlock}

Write a structured daily briefing with these sections:
1. TOP INSIGHT — the single most important signal from today's markets (2-3 sentences)
2. HOT MARKETS — 3 most interesting markets and why they matter right now
3. TREND WATCH — what pattern or narrative is emerging across these markets
4. ALERT — if there were big probability moves, explain what might have caused them (skip if none)
5. ONE PREDICTION — your own bold take on what happens next week

Keep it sharp, data-driven, and useful for someone tracking the AI industry.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/ai-prediction-tracker",
        "X-Title": "AI Prediction Tracker",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Analysis unavailable.";
  } catch (err) {
    console.error(`OpenRouter error (${lang}):`, err.message);
    return "Analysis unavailable.";
  }
}

// ── save JSON + markdown ──────────────────────────────────────────────────────

function saveReport(date, markets, alerts, insightEN, insightRU) {
  ensureDir(REPORTS_DIR);

  // JSON (for weekly.py and charts)
  const json = {
    date,
    generatedAt: new Date().toISOString(),
    markets,
    alerts,
    insight: { en: insightEN, ru: insightRU },
  };
  fs.writeFileSync(
    path.join(REPORTS_DIR, `${date}-report.json`),
    JSON.stringify(json, null, 2)
  );

  // Markdown bilingual
  const alertMd =
    alerts.length > 0
      ? `\n## ⚡ Alerts / Алерты\n${alerts
          .map(
            (a) =>
              `- **${a.question}** moved ${a.delta > 0 ? "+" : ""}${a.delta}pp → **${a.now}%**`
          )
          .join("\n")}\n`
      : "";

  const marketTable = markets
    .map(
      (m) =>
        `| ${m.question.slice(0, 60)}… | ${m.probability ?? "?"}% | $${m.volume24h} | ${m.endDate} |`
    )
    .join("\n");

  const md = `# 🤖 AI Prediction Tracker — ${date}

## 📊 Top AI Markets on Polymarket

| Market | Probability | 24h Volume | Closes |
|--------|-------------|------------|--------|
${marketTable}
${alertMd}
---

## 🧠 Daily Insight (English)

${insightEN}

---

## 🧠 Ежедневный анализ (Русский)

${insightRU}

---
*Generated automatically by [ai-prediction-tracker](https://github.com) bot • ${new Date().toISOString()}*
`;

  fs.writeFileSync(path.join(REPORTS_DIR, `${date}-report.md`), md);
  console.log(`✅ Report saved: ${date}`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 AI Prediction Tracker starting — ${today()}`);

  const markets = await fetchAIMarkets();
  console.log(`📊 Found ${markets.length} AI markets`);

  const alerts = detectAlerts(markets);
  console.log(`⚡ Alerts: ${alerts.length}`);

  console.log("🧠 Generating EN insight...");
  const insightEN = await generateInsight(markets, alerts, "en");

  console.log("🧠 Generating RU insight...");
  const insightRU = await generateInsight(markets, alerts, "ru");

  saveReport(today(), markets, alerts, insightEN, insightRU);
  console.log("✅ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
