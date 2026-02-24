# Norwegian B1 Tracker

A local React application designed to help users track their Norwegian (Bokmal) B1 language learning progress through a structured 12-week curriculum. It includes built-in course materials, interactive topic tracking, and AI prompt generation for personalized lessons via Claude.

## Features

- **12-week curriculum** with 84 unique topics across 4 phases:
  - **Foundation** (Weeks 1-3) — Introductions, daily life, opinions, core grammar
  - **Tech + Norsk** (Weeks 4-6) — IT vocabulary, work communication, Norwegian culture & society
  - **DevOps + Diskusjon** (Weeks 7-9) — CI/CD, cloud, monitoring, daily discussions, argumentation
  - **Avansert + Intervju** (Weeks 10-12) — Software engineering, interview prep, Norskproven B1 practice
- **Daily structure** — Each day has 2 topics (vocab + grammar) with 3 sessions tailored by day type (Heavy/Light/Review)
- **Topic tracking** — Mark topics as done, pending, or skip with progress persisted in localStorage
- **AI prompt generation** — One-click prompt builder with spaced repetition from oldest completed topics, ready to paste into Claude
- **Dark mode** — Toggle between light and dark themes, preference saved across sessions

## Installation

```bash
npm install
```

## Running

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## How It Works

1. Select a phase and week to see 7 day cards
2. Expand a day to see its vocab + grammar topics
3. Mark topics as done after learning, or skip if already known
4. Click "Generate & Copy" to get an AI lesson prompt with your full topic history
5. Paste the prompt into Claude for a personalized Norwegian lesson
6. Tick the day as complete when all 3 sessions are done

## Tech Stack

- React 18 + Vite
- localStorage for persistence
- No external API dependencies — all curriculum data is built in
