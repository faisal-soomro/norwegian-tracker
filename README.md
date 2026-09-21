# Norwegian tracker — «I dag»

A one-page daily tracker for keeping spoken Norwegian warm after the Norskprøve muntlig (September
2026), following [`norsk_daily/docs/plan-v3.md`](https://github.com/faisal-soomro/norsk_daily/blob/main/docs/plan-v3.md):
one theme per week for twelve weeks, ten minutes of spoken grammar on weekdays, thirty minutes of
talking on Saturday and Sunday.

The page is static HTML. It is **generated** from the markdown in `norsk_daily`; nothing here is
content. Progress lives in the browser's localStorage, so it is per device, and there is no account
and no server-side state.

## What the page shows

| Day | Ten or thirty minutes | Built from |
|---|---|---|
| Mon–Fri | The day's grammar rule, one of your own model answers with audio, three words from that clip with a gloss and an example sentence, five spoken transformation drills on sentences from the answer with the answer key folded, one 60-second cold round that must use the three words, a Ferdig button | `exam/drills-v3.md`, `exam/tema-familier.md`, `audio/modellsvar/` |
| Sat | Warm-up clip, the week's 15 words as chips, one ChatGPT voice prompt for a 25-minute free conversation corrected only on the week's five grammar points and steered to bring the 15 words back | theme title, `ord:` blocks |
| Sun | An unseen question with a 2-minute timer, a ChatGPT prompt that ends in a GAP-RAPPORT, a text box that keeps the report for the next Claude session | `exam/drills-v3.md` (`søndag:`) |
| Week 11 | Same weekday shape, drills drawn from all ten weeks | — |
| Week 12 | Mock: a question from the full learnnorsk inventory each day, timer, then the day's rule | `exam/alle-sporsmal.md` |

«Ferdig» advances a queue, never a calendar. Tapping a day chip or the week arrows lets you look
around without changing the queue.

## Build

Requires Python 3 and a checkout of `norsk_daily` next to this repo (or point `NORSK_DAILY` at it).
The audio must exist there first: `./scripts/generate-modellsvar-audio.sh` in `norsk_daily`.

```bash
python3 build.py
```

Writes `site/index.html` and copies the 40 clips into `site/audio/`. `site/` is committed, so the
server needs nothing but this repo.

## Run

Locally:

```bash
python3 -m http.server 8765 --directory site
```

On bulbul (the fleet gateway in `local_ai_lab`), the container joins the `infra` network and Caddy
fronts it as `norsk.home` (the old scenario viewer container `norsk_daily` can be stopped):

```bash
docker compose up -d
```

The Caddy entry lives in `local_ai_lab/infra/Caddyfile`; the `norsk.home` DNS record already exists, so
no Pi-hole change is needed. Reload Caddy after pulling the Caddyfile.

## Editing content

Edit the markdown in `norsk_daily`, then rebuild:

- `exam/drills-v3.md` — the rules, the five drills and three glossed words per weekday, which clips a week uses, the Sunday question.
- `exam/tema-familier.md` — themes, oversikt, model answers.
- `docs/plan-v3.md` — which theme each week gets.

`build.py` refuses to build when a week has the wrong number of drills or the plan and the drills
disagree about a theme, so a typo in the markdown shows up here, not on the phone.

## History

Versions 1 to 5 were a React curriculum app with a 12-week vocab and grammar schedule and prompt
generation for Claude. That app was replaced in v6 once the exam was taken; see `RELEASES.md`.
