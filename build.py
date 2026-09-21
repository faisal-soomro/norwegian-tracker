#!/usr/bin/env python3
"""Build the static tracker site from the norsk_daily markdown.

Reads (from $NORSK_DAILY, default ../norsk_daily):
  docs/plan-v3.md          week -> theme
  exam/tema-familier.md    themes, oversikt, questions, model answers (+ audio ids)
  exam/drills-v3.md        rules per weekday, drills per week/day, clips, Sunday question
  exam/alle-sporsmal.md    question pool for the week-12 mock days
  audio/modellsvar/*.mp3   copied into site/audio/

Writes site/index.html and site/audio/. No dependencies beyond the standard library.
"""
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = Path(os.environ.get("NORSK_DAILY", ROOT.parent / "norsk_daily")).resolve()
OUT = ROOT / "site"

DAYS = ["man", "tir", "ons", "tor", "fre", "lor", "son"]
DAY_NAMES = {"man": "Mandag", "tir": "Tirsdag", "ons": "Onsdag", "tor": "Torsdag",
             "fre": "Fredag", "lor": "Lørdag", "son": "Søndag"}
DAY_SHORT = {"man": "Man", "tir": "Tir", "ons": "Ons", "tor": "Tor", "fre": "Fre", "lor": "Lør", "son": "Søn"}


def read(rel):
    p = SRC / rel
    if not p.exists():
        sys.exit(f"missing source file: {p}")
    return p.read_text(encoding="utf8")


def strip_md(s):
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    s = re.sub(r"\*(.+?)\*", r"\1", s)
    return s.strip()


def parse_plan():
    weeks = {}
    for m in re.finditer(r"^\| (\d+) \| (.+?) \| (\d+) \| (.+?) \|$", read("docs/plan-v3.md"), re.M):
        for w, t in ((m.group(1), m.group(2)), (m.group(3), m.group(4))):
            mm = re.match(r"(\d+) (.+)", t)
            weeks[int(w)] = {"theme": int(mm.group(1)), "title": mm.group(2)} if mm else {"theme": None, "title": t}
    if len(weeks) != 12:
        sys.exit(f"plan-v3.md: expected 12 weeks, found {len(weeks)}")
    return weeks


def parse_themes():
    text = read("exam/tema-familier.md")
    themes = {}
    for m in re.finditer(r"^### (\d+)\. (.+?)\n(.*?)(?=^### \d+\. |^## )", text, re.M | re.S):
        n, title, body = int(m.group(1)), m.group(2).strip(), m.group(3)
        oversikt = [strip_md(l[2:]) for l in body.split("\n") if l.startswith("- **") and "Kort modellsvar" not in l]
        questions = [{"form": q.group(1), "q": strip_md(q.group(2)), "angle": q.group(3)}
                     for q in re.finditer(r"^- \*\*([ABCV])\*\* — (.+?) · \*(.+?)\*$", body, re.M)]
        answers = {}
        for a in re.finditer(r"\*\*([ABCV]) · (.+?)\*\* · 🔊 `audio/modellsvar/(\d\d-\d)\.mp3`\n\n(.+?)\n", body):
            answers[a.group(3)] = {"form": a.group(1), "q": a.group(2), "text": a.group(4).strip()}
        themes[n] = {"n": n, "title": title, "oversikt": oversikt, "questions": questions, "answers": answers}
    if len(themes) != 10:
        sys.exit(f"tema-familier.md: expected 10 themes, found {len(themes)}")
    return themes


def parse_drills():
    text = read("exam/drills-v3.md")
    rules = {}
    rules_block = text.split("## Regler", 1)[1].split("\n## ", 1)[0]
    for m in re.finditer(r"^### (\w+) — (.+?)\n(.*?)(?=^### |\Z)", rules_block, re.M | re.S):
        day, title, body = m.group(1), m.group(2).strip(), m.group(3)
        fields = {"title": title, "text": "", "pattern": "", "task": "", "source": ""}
        for line in body.strip().split("\n"):
            if line.startswith("mønster:"):
                fields["pattern"] = strip_md(line[len("mønster:"):])
            elif line.startswith("oppgave:"):
                fields["task"] = line[len("oppgave:"):].strip()
            elif line.startswith("kilde:"):
                fields["source"] = line[len("kilde:"):].strip()
            elif line.strip():
                fields["text"] += line.strip() + " "
        fields["text"] = fields["text"].strip()
        rules[day] = fields
    weeks = {}
    for m in re.finditer(r"^## Uke (\d+) — (\d+) (.+?)\n(.*?)(?=^## Uke |\Z)", text, re.M | re.S):
        w, theme, body = int(m.group(1)), int(m.group(2)), m.group(4)
        clips = re.search(r"^klipp: (.+)$", body, re.M).group(1).split()
        sunday = re.search(r"^søndag: (.+)$", body, re.M).group(1).strip()
        days = {}
        for d in re.finditer(r"^### (\w+)\n(.*?)(?=^### |\Z)", body, re.M | re.S):
            items, words = [], []
            for line in d.group(2).strip().split("\n"):
                if not line.startswith("- "):
                    continue
                if " => " not in line:
                    wm = re.match(r"- (.+?) — (.+?) · (.+)$", line)
                    if not wm:
                        sys.exit(f"drills-v3.md: uke {w} {d.group(1)}: bad ord line: {line}")
                    words.append({"word": wm.group(1).strip(), "gloss": wm.group(2).strip(), "example": wm.group(3).strip()})
                    continue
                left, fasit = line[2:].rsplit(" => ", 1)
                if " → " in left:
                    prompt, hint = left.split(" → ", 1)
                else:
                    prompt, hint = left, ""
                items.append({"prompt": prompt.strip(), "hint": hint.strip(), "fasit": fasit.strip()})
            if len(items) != 5:
                sys.exit(f"drills-v3.md: uke {w} {d.group(1)} has {len(items)} drills, expected 5")
            if len(words) != 3:
                sys.exit(f"drills-v3.md: uke {w} {d.group(1)} has {len(words)} ord, expected 3")
            days[d.group(1)] = {"drills": items, "words": words}
        for d in DAYS[:5]:
            if d not in days:
                sys.exit(f"drills-v3.md: uke {w} missing {d}")
        weeks[w] = {"theme": theme, "clips": clips, "sunday": sunday, "days": days}
    return rules, weeks


def parse_question_pool():
    text = read("exam/alle-sporsmal.md")
    pool = []
    for section in re.finditer(r"^## (Oppgave [13].*?)\n(.*?)(?=^## |\Z)", text, re.M | re.S):
        for line in section.group(2).split("\n"):
            if line.startswith("- "):
                q = re.sub(r"\s*\*\(.*?\)\*\s*$", "", line[2:]).strip()
                if q.endswith("?") or q.lower().startswith(("fortell", "kan du", "beskriv")):
                    pool.append(q)
    return pool


def build_data():
    plan = parse_plan()
    themes = parse_themes()
    rules, drill_weeks = parse_drills()
    pool = parse_question_pool()
    for w in range(1, 11):
        if w not in drill_weeks:
            sys.exit(f"drills-v3.md: uke {w} missing")
        if drill_weeks[w]["theme"] != plan[w]["theme"]:
            sys.exit(f"uke {w}: plan says theme {plan[w]['theme']}, drills say {drill_weeks[w]['theme']}")
    return {
        "plan": {str(k): v for k, v in plan.items()},
        "themes": {str(k): v for k, v in themes.items()},
        "rules": rules,
        "drills": {str(k): v for k, v in drill_weeks.items()},
        "pool": pool,
        "days": DAYS,
        "dayNames": DAY_NAMES,
        "dayShort": DAY_SHORT,
    }


def copy_audio(data):
    (OUT / "audio").mkdir(parents=True, exist_ok=True)
    ids = {cid for t in data["themes"].values() for cid in t["answers"]}
    missing = []
    for cid in sorted(ids):
        src = SRC / "audio" / "modellsvar" / f"{cid}.mp3"
        if not src.exists():
            missing.append(cid)
            continue
        shutil.copy2(src, OUT / "audio" / f"{cid}.mp3")
    if missing:
        print(f"warning: {len(missing)} audio files missing in {SRC/'audio/modellsvar'}: {' '.join(missing)}\n"
              f"         run ./scripts/generate-modellsvar-audio.sh in norsk_daily first", file=sys.stderr)
    return len(ids) - len(missing)


TEMPLATE = (ROOT / "template.html").read_text(encoding="utf8")


def main():
    data = build_data()
    OUT.mkdir(exist_ok=True)
    n_audio = copy_audio(data)
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = TEMPLATE.replace("/*__DATA__*/null", payload)
    (OUT / "index.html").write_text(page, encoding="utf8")
    print(f"site/index.html written ({len(page)//1024} KB), {n_audio} audio clips, "
          f"{len(data['themes'])} themes, {len(data['drills'])} drill weeks, {len(data['pool'])} mock questions")


if __name__ == "__main__":
    main()
