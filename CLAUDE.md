# CLAUDE.md — norwegian-tracker

Guidance for Claude Code working in this repository, on the Mac or on bulbul.

## What this is

A **generated static page** («I dag») that runs Faisal's twelve-week Norwegian plan after the
Norskprøve muntlig (21 Sept 2026): one theme per week, ten minutes of spoken grammar on weekdays,
thirty minutes of talking on weekends. The plan and every word of content live in the sibling repo
**`norsk_daily`** (`docs/plan-v3.md`, `exam/tema-familier.md`, `exam/drills-v3.md`,
`exam/alle-sporsmal.md`, `audio/modellsvar/`). This repo holds only:

| File | Role |
|---|---|
| `build.py` | Reads the norsk_daily markdown, writes `site/index.html`, copies the 40 clips to `site/audio/`. Stdlib only. Fails loudly on malformed content. |
| `template.html` | The page: CSS, markup, and the JS that renders a day from the embedded JSON. |
| `site/` | **Generated output, committed on purpose** so the server needs nothing but this repo. About 20 MB, mostly mp3. |
| `Dockerfile` | Two lines: `nginx:alpine` + `COPY site/`. |
| `docker-compose.yml` | Builds that image and runs it on the `infra` network as container `norsk_tracker`. |
| `README.md`, `RELEASES.md` | User docs and version history. |

Progress (which days are Ferdig, the Sunday GAP text) lives only in the phone browser's
localStorage. There is no backend, no account, no database.

## Branch

Work happens on **`v6-static-tracker`** and bulbul deploys **from that branch**. Do not open or merge
a PR to `main` until Faisal says so; he wants a week or two of use first. Versions 1–5 on `main` are
the retired React app.

## Git rules

- Author must be `faisal-soomro <h.faisalsoomro@gmail.com>`; flag it if `git config` differs.
- **Never commit or push unless Faisal explicitly asks.** Report what changed and let him decide.
- A local pre-push hook blocks pushing `main` directly. Push the working branch.
- Use `trash`, not `rm`, for deletions.

## Deploy on bulbul (fleet gateway in `local_ai_lab`)

Caddy on bulbul serves the tracker as **`norsk.home`** (Caddyfile already points there, commit
e52a573 in `local_ai_lab`). The job is: clone the repo, build the image from the Dockerfile, run it
with compose. Nothing else.

```bash
cd ~/dev_workspace && git clone -b v6-static-tracker https://github.com/faisal-soomro/norwegian-tracker.git
cd norwegian-tracker && docker compose up -d --build
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
docker stop norsk_daily && docker rm norsk_daily      # the old scenario viewer that had norsk.home
```

No Pi-hole change: the `norsk.home` record already exists. No Python on bulbul: `site/` is prebuilt.

**Updating bulbul later:** `git pull && docker compose up -d --build` in that folder.
Check with `curl -s -o /dev/null -w "%{http_code}\n" -H "Host: norsk.home" http://127.0.0.1/`.

## Changing content (on the Mac, where norsk_daily is)

1. Edit the markdown in `norsk_daily`, never `site/index.html` and never the JSON inside it.
   - a drill, a word, a Sunday question → `exam/drills-v3.md`
   - a model answer or theme text → `exam/tema-familier.md` (then regenerate audio with
     `./scripts/generate-modellsvar-audio.sh` there)
   - which theme a week gets → `docs/plan-v3.md`
2. `python3 build.py` here. It refuses to build if a week has other than five drills or three `ord:`
   lines per weekday, or if plan and drills disagree on a theme. Fix the markdown, not the script.
3. Ask Faisal before committing `site/` and pushing the branch; then `git pull && docker compose up -d --build` on bulbul.

`NORSK_DAILY=/path/to/norsk_daily python3 build.py` if the repos are not side by side.

## Changing the page itself

Edit `template.html` (structure, wording, CSS) or `build.py` (parsing, data shape), rebuild, and
check locally with `python3 -m http.server 8765 --directory site`. Keep the page dependency-free:
no npm, no framework, fonts from Google Fonts only, everything else inline. Both themes (light and
dark) must stay readable; colors are tokens on `:root`.

## Drill file format (what `build.py` expects)

```
## Uke <n> — <theme number> <theme title>
klipp: <clip id> ×5            # e.g. 04-6 04-1 ..., one per weekday, from audio/modellsvar
søndag: <unseen question>
### man|tir|ons|tor|fre
ord:
- <ord> — <forklaring> · <eksempelsetning>      # exactly three
- <utgangspunkt> → <hint> => <fasit>            # exactly five; the hint is optional
```

Rules for the five weekdays sit once at the top under `## Regler` with `mønster:`, `oppgave:` and
`kilde:` lines. Weeks 11 and 12 have no block: the page builds them from the archive and from
`exam/alle-sporsmal.md`.
