# Release Notes

---

## v4.0 — Dual-Purpose Curriculum (B1 Exam + Tech)

Reorganized the curriculum so all standard Norskproven B1 topics are covered, while keeping tech content as context rather than standalone weeks.

### Problem
Previous versions had 3-4 weeks of standalone tech/DevOps content (old W4, W7, W9, W10) that wouldn't appear on the actual Norskproven exam. Several core B1 topics were missing entirely.

### New Curriculum Structure
| Week | Theme | Status |
|------|-------|--------|
| 1 | Komme i gang (Getting started) | Unchanged |
| 2 | Hverdagsliv (Daily life & work) | Unchanged |
| 3 | Meninger og folelser (Opinions & feelings) | Unchanged |
| 4 | **Helse og velvare** (Health & wellbeing) | NEW |
| 5 | **Bolig og naermiljo** (Housing & neighborhood) | NEW |
| 6 | Norsk kultur og samfunn (Culture & society) | Unchanged |
| 7 | **Handel, tjenester og reise** (Shopping, services & travel) | NEW |
| 8 | **Familie, utdanning og fritid** (Family, education & leisure) | NEW |
| 9 | **Diskusjoner og aktuelle temaer** (Discussions & current events) | Restructured |
| 10 | **Teknologi i hverdagen og pa jobb** (Tech in daily life & work) | Condensed tech |
| 11 | Intervjuforberedelse (Interview prep) | Unchanged |
| 12 | Muntlig eksamensforberedelse (Exam prep) | Unchanged |

### What Changed
- 6 weeks rewritten with proper B1 exam topics: health, housing, shopping/travel, family/education, discussions
- All tech content condensed into Week 10, framed as "technology in daily life" (a valid B1 topic)
- Grammar reframed — same grammatical concepts, but examples use health/housing/travel context instead of DevOps
- Tech vocabulary sprinkled into other weeks naturally (e.g., "helse-app", "Finn.no", "nettbutikk", "Vipps")

---

## v3.1 — Skriftlig Reinforces Muntlig

Enhanced the writing phase (Skriftlig) to build thinking patterns that transfer to speaking later.

### Changes
- **Heavy day S2**: Written opinion pieces (80-120 words with connectors) + written paired discussions (8-10 exchange dialogues)
- **Light day S2**: Quick opinion writing + mini dialogue exercises
- **Sunday review**: Written mock discussion — simulates muntlig exam format on paper
- **Instructions**: Emphasize building THINKING PATTERNS for speaking through writing

---

## v3.0 — Writing to Speaking Progression

Instead of 100% oral from day 1, introduces a gradual mode progression across the 4 phases.

### Mode Progression
| Phase | Weeks | Mode | Description |
|-------|-------|------|-------------|
| 1 | 1-3 | Skriftlig (Writing) | Written exercises — sentences, paragraphs, fill-in-the-blank |
| 2 | 4-6 | Blandet (Mixed) | Write first, then speak — read-aloud, simple spoken responses |
| 3 | 7-9 | Muntlig-fokus | Mostly oral, written notes as scaffolding |
| 4 | 10-12 | Muntlig (Full oral) | 100% speaking — mock exams, interview prep |

### New Features
- Mode-aware prompt generation (exercise style adapts per phase)
- Mode progression bar in the UI
- Session summaries change per mode
- Refactored prompt builder into 5 helper functions

---

## v2.0 — Muntlig (Oral) Focus

Pivoted the entire curriculum to focus on the Norskproven B1 muntlig (oral) exam.

### Changes
- All prompts restructured around speaking practice
- Session types: oral drills, listening + shadowing, mock muntlig exams
- Prompt instructions emphasize pronunciation, fluency, and spoken coherence
- Curriculum topics unchanged (same 84 topics)

---

## v1.0 — Initial Version

First version of the Norwegian B1 language learning tracker.

### Features
- 12-week curriculum with 84 unique topics (vocab + grammar per day)
- Daily schedule: heavy days (Mon/Tue/Thu/Fri), light days (Wed/Sat), review (Sun)
- AI prompt generator — generates structured lesson prompts for Claude/ChatGPT
- Topic progress tracking with localStorage persistence
- Phase-based navigation (4 phases x 3 weeks)
- Dark mode support
- Copy-to-clipboard for generated prompts
