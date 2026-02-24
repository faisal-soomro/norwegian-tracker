# Norwegian B1 Muntlig Tracker

A speaking-first React app for preparing for the Norskproven B1 muntlig (oral) exam. Structured 12-week curriculum with role-plays, opinion monologues, paired discussion practice, and mock exam simulations — all driven by AI prompt generation via Claude.

## Features

- **12-week speaking-first curriculum** with 84 topics across 4 phases:
  - **Foundation** (Weeks 1-3) — Introductions, daily life, opinions, core grammar
  - **Tech + Norsk** (Weeks 4-6) — IT vocabulary, spoken workplace communication, Norwegian culture & society
  - **DevOps + Diskusjon** (Weeks 7-9) — CI/CD, cloud, monitoring, verbal explanations, argumentation
  - **Avansert + Intervju** (Weeks 10-12) — Software engineering, interview prep, muntlig exam simulation
- **Muntlig-focused sessions:**
  - Heavy days: Oral drills + role-play scenarios + opinion monologues
  - Light days: Listening & shadowing + quick-fire speaking
  - Sundays: Full mock muntlig exam (self-intro, opinion, paired discussion)
- **Oral Refresher** — Spaced repetition done out loud: vocab recall, spoken grammar drills, impromptu speaking prompts
- **AI prompt generation** — One-click prompt builder with full topic history, ready to paste into Claude for speaking-focused lessons
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
4. Click "Generate & Copy" — Claude generates speaking exercises: role-plays, monologues, discussion prompts
5. Session 2 is always speaking practice: role-plays, opinion questions, paired discussions
6. Session 3 (Oral Refresher) uses spaced repetition — all exercises spoken aloud
7. Sundays: full mock Norskproven B1 muntlig simulation
8. Tick the day as complete when all 3 sessions are done

## Tech Stack

- React 18 + Vite
- localStorage for persistence
- No external API dependencies — all curriculum data is built in
