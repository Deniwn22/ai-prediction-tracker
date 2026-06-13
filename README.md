# 🍩 AI Prediction Tracker

[![Daily Report](https://github.com/Deniwn22/ai-prediction-tracker/actions/workflows/daily-report.yml/badge.svg)](https://github.com/Deniwn22/ai-prediction-tracker/actions/workflows/daily-report.yml)
[![Reports](https://img.shields.io/badge/dynamic/json?url=https://api.github.com/repos/Deniwn22/ai-prediction-tracker/contents/reports&label=reports&query=$.length&color=yellow&logo=github)](https://github.com/Deniwn22/ai-prediction-tracker/tree/main/reports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Powered by Polymarket](https://img.shields.io/badge/Powered%20by-Polymarket-blue)](https://polymarket.com)
[![Powered by OpenRouter](https://img.shields.io/badge/Powered%20by-OpenRouter-purple)](https://openrouter.ai)

> *"In this house we obey the laws of Polymarket!"* — Homer J. Simpson

**Daily AI market intelligence — auto-updated twice a day by a bot. No humans involved. 🤖**

Tracks the most active AI prediction markets on Polymarket, generates bilingual EN/RU analysis via OpenRouter, and publishes everything to a public archive that grows every day.

---

## 🌐 Live Site

👉 **[View Live Dashboard](https://your-vercel-url.vercel.app)**

---

## ⚡ What the bot does every day
┌─────────────────────────────────────────────────────┐

│                  GitHub Actions                      │

│                  (2x per day)                        │

└──────────────────┬──────────────────────────────────┘

│

┌────────▼────────┐

│  Polymarket API  │

│  Top AI markets  │

│  volumes, odds   │

└────────┬─────────┘

│

┌────────▼────────┐

│  OpenRouter AI   │

│  Insight in EN   │

│  Insight in RU   │

└────────┬─────────┘

│

┌────────▼─────────┐

│  reports/ folder  │

│  JSON + Markdown  │

│  auto-committed   │

└────────┬──────────┘

│

┌────────▼────────┐

│   Live website   │

│   Vercel deploy  │

│   auto-updates   │

└─────────────────┘

---

## 📊 Features

| Feature | Description |
|---------|-------------|
| 🤖 Auto-updates | Runs at 09:00 + 10:00 UTC daily via GitHub Actions |
| 🌐 Bilingual | Every report in English + Russian |
| ⚡ Alert system | Flags markets that moved >10% probability |
| 📈 Growing archive | Every day adds new JSON + Markdown files |
| 🍩 Simpsons theme | Because why not |
| 🛋️ Couch gag | Secret easter egg on the website |
| 📉 Trend charts | Visual archive growth over time |

---

## 🗂️ Report structure

Each daily report contains:
- **Top 10 AI markets** — question, probability, 24h volume, closing date
- **Alert detection** — markets that moved >10% since yesterday
- **AI insight (EN)** — analysis by OpenRouter
- **AI insight (RU)** — same analysis in Russian
- Saved as `reports/YYYY-MM-DD-report.json` and `reports/YYYY-MM-DD-report.md`

---

## 🔧 Stack

- **Node.js** — bot logic, API calls, file generation
- **GitHub Actions** — scheduling, automation, commits
- **Polymarket Gamma API** — prediction market data
- **OpenRouter** (`openrouter/auto`) — AI analysis
- **Vercel** — static site hosting
- **Vanilla JS** — frontend, no frameworks

---

## 👥 Contributors

This repo has two contributors:
- **Deniwn22** — created and maintains the project
- **github-actions[bot]** — commits daily reports automatically

---

## 📁 File structure
ai-prediction-tracker/

├── bot.js                 # Main bot — fetches, analyzes, saves

├── package.json           # Dependencies

├── index.html             # Live dashboard (Simpsons theme 🍩)

├── .github/

│   └── workflows/

│       └── daily-report.yml  # GitHub Actions schedule

└── reports/

├── 2025-01-01-report.json

├── 2025-01-01-report.md

└── ...                # Grows every day

---

## 🚀 How to fork & run

1. Fork this repo
2. Add 3 secrets in Settings → Secrets → Actions:
   - `OPENAI_API_KEY` — your OpenRouter key
   - `GH_PAT` — GitHub personal access token (repo + workflow)
   - `TALENT_WALLET` — your Base wallet address
3. Go to Actions → Run workflow manually
4. Deploy `index.html` to Vercel

---

*Auto-generated reports live in [`/reports`](./reports) · Bot runs on GitHub's servers · Your computer stays off 🍩*
