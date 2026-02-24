import { useState, useEffect, useCallback } from "react";

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
const SHARED = {
  green: { light: "#a8d5ba", mid: "#5a9e74" },
  blue: { light: "#7eb8da", mid: "#3a7fa3" },
  purple: { light: "#d4a5e5", mid: "#9a5cb8" },
  gold: { light: "#f0c86e", mid: "#c4993a" },
  red: { light: "#e88", mid: "#c44" },
};
const LIGHT = {
  bg: "#fafafa", surface: "#ffffff", surfaceHi: "#f0f0f5", border: "#dcdce8",
  text: "#1a1a2e", textMute: "#4a4a60", textDim: "#7a7a94",
  promptBg: "#eeeef5",
  ...SHARED,
};
const DARK = {
  bg: "#0f0f1a", surface: "#1a1a2e", surfaceHi: "#222238", border: "#2a2a40",
  text: "#e2e2ee", textMute: "#9a9ab0", textDim: "#6a6a84",
  promptBg: "#1e1e30",
  ...SHARED,
};

const PHASES = [
  { id: 1, label: "Foundation", subtitle: "Generell B1", weeks: [1, 2, 3], color: SHARED.green },
  { id: 2, label: "Tech + Norsk", subtitle: "IT + Kultur", weeks: [4, 5, 6], color: SHARED.blue },
  { id: 3, label: "DevOps + Diskusjon", subtitle: "Ops + Daglig", weeks: [7, 8, 9], color: SHARED.purple },
  { id: 4, label: "Avansert + Intervju", subtitle: "SWE + Prep", weeks: [10, 11, 12], color: SHARED.gold },
];

// ─── CURRICULUM (all 84 unique topics) ───────────────────────────────────────
const CUR = {
  1: {
    theme: "Komme i gang", focus: "Introductions, daily routines, present tense", days: {
      0: { v: { id: "v1d0", t: "Å presentere seg", en: "Introductions", kw: ["Hei", "Jeg heter", "Jeg er", "Hvor kommer du fra", "Hyggelig å møte deg"] }, g: { id: "g1d0", t: "Presens – oversikt", en: "Present tense (all persons)", kw: ["jeg er", "du er", "han er", "vi er", "dere er", "de er"] } },
      1: { v: { id: "v1d1", t: "Daglige rutiner", en: "Daily routines", kw: ["stå opp", "spise frokost", "jobbe", "sove", "lage mat", "handle"] }, g: { id: "g1d1", t: "Ordstilling – helsetninger", en: "Word order – main clauses", kw: ["V2-regel", "subjekt", "verbal", "inversjon", "leddsetning"] } },
      2: { v: { id: "v1d2", t: "Mat og drikke", en: "Food & drink", kw: ["kaffe", "brød", "kjøtt", "grønnsaker", "bestille", "smake"] }, g: { id: "g1d2", t: "Substantiv – kjønn", en: "Noun gender basics", kw: ["en", "ei", "et", "gutt", "jente", "hus", "bestemt form"] } },
      3: { v: { id: "v1d3", t: "Tid og avtaler", en: "Time & scheduling", kw: ["mandag", "klokka", "i dag", "i morgen", "i går", "avtale"] }, g: { id: "g1d3", t: "Klokkeslett", en: "Telling time", kw: ["kvart over", "halv", "kvart på", "ti over", "fem på"] } },
      4: { v: { id: "v1d4", t: "Følelser og meninger", en: "Feelings & opinions", kw: ["glad", "trist", "fornøyd", "nervøs", "tenke", "synes"] }, g: { id: "g1d4", t: "Modale verb – innføring", en: "Modal verbs intro", kw: ["kan", "må", "vil", "skal", "bør", "får"] } },
      5: { v: { id: "v1d5", t: "Vær og omgivelser", en: "Weather", kw: ["sol", "regn", "kaldt", "varmt", "ute", "Oslo"] }, g: { id: "g1d5", t: "Adjektiv – bøyning intro", en: "Adjective agreement intro", kw: ["et stort hus", "den klare lufta", "en kald dag"] } },
      6: null
    }
  },
  2: {
    theme: "Hverdagsliv", focus: "Everyday life, past tense, modal verbs", days: {
      0: { v: { id: "v2d0", t: "Arbeidsplassen", en: "Workplace", kw: ["kontor", "kollega", "oppgave", "prosjekt", "avdeling", "sjef"] }, g: { id: "g2d0", t: "Preteritum – sterke verb", en: "Past tense (irregular)", kw: ["gikk", "var", "så", "skrev", "snakket"] } },
      1: { v: { id: "v2d1", t: "Arbeidserfaring", en: "Work experience", kw: ["erfaring", "yrkesmessig", "ansatt", "studier", "fullført", "praksis"] }, g: { id: "g2d1", t: "Preteritum – svake verb", en: "Past tense (regular)", kw: ["jobbet", "lærte", "lagde", "forklarte", "avsluttet"] } },
      2: { v: { id: "v2d2", t: "Kontorlivet", en: "Office daily life", kw: ["e-post", "møte", "samtale", "rapport", "frist"] }, g: { id: "g2d2", t: "Tidspreposisjoner", en: "Time prepositions", kw: ["siden", "før", "etter", "under", "til", "fra"] } },
      3: { v: { id: "v2d3", t: "Teamarbeid", en: "Teamwork", kw: ["samarbeide", "rolle", "ansvar", "bidra", "resultat"] }, g: { id: "g2d3", t: "Perfektum – har/hadde", en: "Present perfect", kw: ["har gått", "har vært", "har sett", "har skrevet", "har snakket"] } },
      4: { v: { id: "v2d4", t: "Karrieremål", en: "Career goals", kw: ["mål", "strebe etter", "videreutvikle", "karriere", "opprykk"] }, g: { id: "g2d4", t: "Futurum – skal/kommer til å", en: "Future tense", kw: ["skal", "kommer til å", "jeg skal", "vi kommer til å"] } },
      5: { v: { id: "v2d5", t: "Lønn og kontrakt", en: "Salary & contracts", kw: ["lønn", "kontrakt", "brutto", "netto", "feriedager", "prøvetid"] }, g: { id: "g2d5", t: "Passiv – innføring", en: "Passive voice intro", kw: ["blir gjort", "blir sagt", "blir betalt"] } },
      6: null
    }
  },
  3: {
    theme: "Meninger og følelser", focus: "Express opinions, argue, polite language", days: {
      0: { v: { id: "v3d0", t: "Enighet og uenighet", en: "Agreeing & disagreeing", kw: ["enig", "avslå", "motsi", "ha rett", "på den ene siden"] }, g: { id: "g3d0", t: "Leddsetninger – at/fordi", en: "Subordinate clauses", kw: ["at", "fordi", "selv om", "slik at", "hovedsetning", "leddsetning"] } },
      1: { v: { id: "v3d1", t: "Kritikk og ros", en: "Feedback", kw: ["kritisere", "rose", "forbedre", "tilbakemelding", "styrke", "svakhet"] }, g: { id: "g3d1", t: "Relativsetninger", en: "Relative clauses", kw: ["som", "der", "hvilken", "det huset som", "mannen som"] } },
      2: { v: { id: "v3d2", t: "Følelser – utvidet", en: "Extended emotions", kw: ["frustrert", "begeistret", "skuffet", "lettet", "sint"] }, g: { id: "g3d2", t: "Preteritum – repetisjon", en: "Past tense review drill", kw: ["øvelse", "blandet", "fortelle", "fortid"] } },
      3: { v: { id: "v3d3", t: "Bygge argumenter", en: "Forming arguments", kw: ["argument", "begrunne", "eksempel", "for det første", "dessuten", "derfor"] }, g: { id: "g3d3", t: "Kondisjonalis – ville/skulle", en: "Conditional mood", kw: ["Hvis jeg", "ville", "kunne", "ønske", "hypotetisk"] } },
      4: { v: { id: "v3d4", t: "Ønsker og forventninger", en: "Wishes & hopes", kw: ["håpe", "ønske", "forvente", "drømme", "strebe etter"] }, g: { id: "g3d4", t: "Infinitivsetninger – å", en: "Infinitive clauses", kw: ["å", "prøve å", "håpe å", "for å"] } },
      5: { v: { id: "v3d5", t: "Høflig kommunikasjon", en: "Communication phrases", kw: ["Kunne du", "hva mener du", "som sagt", "unnskyld"] }, g: { id: "g3d5", t: "Imperativ", en: "Imperatives", kw: ["Kom", "Gå", "Les", "Skriv", "Vær så snill"] } },
      6: null
    }
  },
  4: {
    theme: "Teknologiens verden", focus: "General IT — computers, internet, software, data", days: {
      0: { v: { id: "v4d0", t: "Datamaskin-grunnlag", en: "Computer basics", kw: ["datamaskin", "skjerm", "tastatur", "mus", "operativsystem", "fil"] }, g: { id: "g4d0", t: "Passiv – utvidet", en: "Passive expanded", kw: ["er blitt gjort", "kan lagres", "ble opprettet"] } },
      1: { v: { id: "v4d1", t: "Internett og nettverk", en: "Internet & networking", kw: ["internett", "nettverk", "server", "nettleser", "sky", "tilkobling"] }, g: { id: "g4d1", t: "Presens partisipp som adjektiv", en: "Participle as adjective", kw: ["den lagrede filen", "det tilkoblede apparatet", "kjørende program"] } },
      2: { v: { id: "v4d2", t: "Programvare-grunnlag", en: "Software basics", kw: ["programvare", "program", "app", "oppdatering", "versjon", "installere", "feil"] }, g: { id: "g4d2", t: "Modale verb – fortid", en: "Modal verbs past", kw: ["kunne", "måtte", "skulle", "fikk", "ville"] } },
      3: { v: { id: "v4d3", t: "Maskinvare", en: "Hardware components", kw: ["prosessor", "RAM", "GPU", "harddisk", "minne"] }, g: { id: "g4d3", t: "Preposisjoner – sted", en: "Prepositions of place", kw: ["på", "i", "ved", "over", "under", "foran", "bak", "ved siden av"] } },
      4: { v: { id: "v4d4", t: "Data og lagring", en: "Data & storage", kw: ["data", "datasett", "lagre", "database", "sikkerhetskopi", "kryptere"] }, g: { id: "g4d4", t: "Eiendomsord og genitiv", en: "Possessives & genitive", kw: ["min", "din", "hans", "hennes", "-s genitiv", "til"] } },
      5: { v: { id: "v4d5", t: "IT-sikkerhet", en: "IT security", kw: ["sikkerhet", "passord", "kryptering", "brannmur", "virus", "beskyttelse"] }, g: { id: "g4d5", t: "Tidssetninger – da/når", en: "Temporal clauses", kw: ["da", "når", "mens", "før", "etter at"] } },
      6: null
    }
  },
  5: {
    theme: "Kommunikasjon på jobb", focus: "Emails, meetings, presentations", days: {
      0: { v: { id: "v5d0", t: "E-post-grunnlag", en: "Email basics", kw: ["emne", "vedlegg", "sende", "motta", "innboks", "svare"] }, g: { id: "g5d0", t: "Formelt vs. uformelt", en: "Formal vs informal", kw: ["De", "du", "Kjære", "Hei", "Med vennlig hilsen"] } },
      1: { v: { id: "v5d1", t: "Telefonsamtaler", en: "Phone conversations", kw: ["ringe", "linje", "talepost", "ringe tilbake", "forbindelse"] }, g: { id: "g5d1", t: "Høflige forespørsler", en: "Polite requests", kw: ["Kunne du", "Ville du", "Hadde du", "vær så snill", "det hadde vært fint"] } },
      2: { v: { id: "v5d2", t: "Møter", en: "Meetings", kw: ["møte", "dagsorden", "referat", "avstemning", "lede"] }, g: { id: "g5d2", t: "Konnektorer", en: "Connectors", kw: ["likevel", "dessuten", "allikevel", "derfor", "på den ene siden", "på den andre siden"] } },
      3: { v: { id: "v5d3", t: "Skrive rapporter", en: "Writing reports", kw: ["rapport", "sammendrag", "oppsummere", "konklusjon", "funn"] }, g: { id: "g5d3", t: "Passiv i tekst", en: "Passive in written text", kw: ["blir skrevet", "ble analysert", "er blitt opprettet"] } },
      4: { v: { id: "v5d4", t: "Presentasjoner", en: "Presentations", kw: ["presentasjon", "holde foredrag", "lysbilde", "publikum", "foredrag"] }, g: { id: "g5d4", t: "Strukturord – foredrag", en: "Structuring talks", kw: ["for det første", "for det andre", "for eksempel", "til slutt"] } },
      5: { v: { id: "v5d5", t: "Nettverksbygging", en: "Professional networking", kw: ["kontakt", "nettverk", "visittkort", "presentere seg"] }, g: { id: "g5d5", t: "Sammensatte setninger", en: "Compound sentences", kw: ["den pågående analysen", "det opprettede dokumentet"] } },
      6: null
    }
  },
  6: {
    theme: "Norsk kultur og samfunn", focus: "Culture, traditions, society, news", days: {
      0: { v: { id: "v6d0", t: "Norsk kultur", en: "Norwegian culture", kw: ["tradisjon", "bunad", "17. mai", "friluftsliv", "dugnad", "hytte"] }, g: { id: "g6d0", t: "Årsakssetninger – fordi/da", en: "Causal clauses", kw: ["fordi", "da", "derfor", "på grunn av", "årsak"] } },
      1: { v: { id: "v6d1", t: "Fordeler og ulemper", en: "Pros & cons", kw: ["fordel", "ulempe", "på den ene siden", "på den andre siden", "vurdere", "risiko"] }, g: { id: "g6d1", t: "Komparativ og superlativ", en: "Comparative & superlative", kw: ["større", "mindre", "størst", "bedre", "jo…desto"] } },
      2: { v: { id: "v6d2", t: "Norsk samfunn", en: "Norwegian society", kw: ["velferd", "likestilling", "demokrati", "skatt", "kommune", "fylke"] }, g: { id: "g6d2", t: "Innrømmende setninger", en: "Concessive clauses", kw: ["selv om", "likevel", "allikevel", "til tross for", "riktignok…men"] } },
      3: { v: { id: "v6d3", t: "Nyheter og media", en: "News & media", kw: ["nyheter", "artikkel", "journalist", "kringkasting", "NRK", "avis"] }, g: { id: "g6d3", t: "Passiv + modale verb", en: "Passive with modals", kw: ["kan forbedres", "må opprettes", "bør vurderes"] } },
      4: { v: { id: "v6d4", t: "Diskusjoner føre", en: "Leading discussions", kw: ["diskutere", "standpunkt", "representere", "konsensus", "overbevise"] }, g: { id: "g6d4", t: "Indirekte tale", en: "Reported speech", kw: ["sa at", "fortalte at", "mente at", "ifølge"] } },
      5: { v: { id: "v6d5", t: "Oppsummering", en: "Summary phrases", kw: ["oppsummert", "kort sagt", "for å oppsummere", "til slutt"] }, g: { id: "g6d5", t: "Småord og partikler", en: "Discourse particles", kw: ["jo", "da", "vel", "nok", "egentlig", "visst", "altså"] } },
      6: null
    }
  },
  7: {
    theme: "DevOps-grunnlag", focus: "CI/CD, cloud, infrastructure, containers", days: {
      0: { v: { id: "v7d0", t: "DevOps-grunnlag", en: "DevOps fundamentals", kw: ["DevOps", "automatisering", "kontinuerlig levering", "infrastruktur", "utrulling"] }, g: { id: "g7d0", t: "Tekniske tekster", en: "Structuring tech text", kw: ["for det første", "i tillegg", "i denne sammenhengen", "tjener til"] } },
      1: { v: { id: "v7d1", t: "Skyplattformer", en: "Cloud platforms", kw: ["sky", "AWS", "Azure", "tjeneste", "virtuell maskin", "skalerbarhet"] }, g: { id: "g7d1", t: "Passiv – fagspråk", en: "Passive in technical writing", kw: ["ble konfigurert", "blir brukt", "er blitt beregnet"] } },
      2: { v: { id: "v7d2", t: "Containere og Docker", en: "Containers & Docker", kw: ["container", "Docker", "image", "Kubernetes", "orkestrering", "pod"] }, g: { id: "g7d2", t: "Tekniske verb", en: "Tech verb phrases", kw: ["sette i drift", "anvende", "gjennomføre", "implementere"] } },
      3: { v: { id: "v7d3", t: "CI/CD-pipeliner", en: "CI/CD pipelines", kw: ["pipeline", "bygg", "test", "deploy", "integrasjon", "automatisert"] }, g: { id: "g7d3", t: "Formålssetninger – for å/slik at", en: "Purpose clauses", kw: ["for å", "slik at", "med formål om", "hensikt"] } },
      4: { v: { id: "v7d4", t: "Infrastruktur som kode", en: "Infrastructure as Code", kw: ["IaC", "Terraform", "Ansible", "konfigurasjon", "provisjonering", "versjonskontroll"] }, g: { id: "g7d4", t: "Sammenligningsstrukturer", en: "Comparison structures", kw: ["sammenligne", "høyere enn", "sammenlignet med"] } },
      5: { v: { id: "v7d5", t: "Nettverkssikkerhet", en: "Network security", kw: ["sikkerhet", "brannmur", "VPN", "tilgangskontroll", "sårbarhet", "oppdatering"] }, g: { id: "g7d5", t: "Konklusjonssetninger", en: "Conclusion patterns", kw: ["Ut fra dette kan vi utlede", "Det følger av", "Konklusjonen er"] } },
      6: null
    }
  },
  8: {
    theme: "Daglige diskusjoner", focus: "Arguments, current events, persuasion, opinions", days: {
      0: { v: { id: "v8d0", t: "Aktuelle hendelser", en: "Current events", kw: ["hendelse", "politikk", "økonomi", "klima", "debatt", "innvandring"] }, g: { id: "g8d0", t: "Argumentasjonsstruktur", en: "Argumentation structure", kw: ["påstand", "begrunnelse", "eksempel", "motargument", "konklusjon"] } },
      1: { v: { id: "v8d1", t: "Overbevisende språk", en: "Persuasive language", kw: ["overbevise", "innlysende", "plausibel", "logisk", "bevis"] }, g: { id: "g8d1", t: "Konjunksjoner – avansert", en: "Advanced conjunctions", kw: ["enten…eller", "verken…eller", "både…og", "jo…desto"] } },
      2: { v: { id: "v8d2", t: "Kritisk tenkning", en: "Critical thinking", kw: ["stille spørsmål", "analysere", "vurdere", "reflektere", "perspektiv"] }, g: { id: "g8d2", t: "Setningsadverbialer", en: "Sentence adverbials", kw: ["dessverre", "heldigvis", "sannsynligvis", "tydeligvis", "selvfølgelig"] } },
      3: { v: { id: "v8d3", t: "Hverdagssamtaler", en: "Everyday conversations", kw: ["småprat", "vær", "helg", "planer", "hobby", "ferie"] }, g: { id: "g8d3", t: "Forklarende strukturer", en: "Explanatory sentences", kw: ["det betyr at", "det vil si", "med det mener jeg", "nemlig"] } },
      4: { v: { id: "v8d4", t: "Konfliktløsning", en: "Conflict resolution", kw: ["konflikt", "løse", "kompromiss", "forståelse", "mekle", "enighet"] }, g: { id: "g8d4", t: "Betingelsessetninger – hvis/dersom", en: "Conditional sentences", kw: ["hvis", "dersom", "i tilfelle", "forutsatt at", "med mindre"] } },
      5: { v: { id: "v8d5", t: "Sosiale medier", en: "Social media discourse", kw: ["sosiale medier", "debatt", "ytringsfrihet", "personvern", "digital", "innhold"] }, g: { id: "g8d5", t: "Refererende setninger", en: "Referencing & quoting", kw: ["ifølge", "som nevnt", "det hevdes at", "med henvisning til"] } },
      6: null
    }
  },
  9: {
    theme: "Overvåking og feilsøking", focus: "Monitoring, debugging, logging, troubleshooting", days: {
      0: { v: { id: "v9d0", t: "Overvåking og logging", en: "Monitoring & logging", kw: ["overvåking", "logg", "varsling", "dashbord", "metrikk", "oppetid"] }, g: { id: "g9d0", t: "Prosessbeskrivelse", en: "Step-by-step description", kw: ["først", "deretter", "så", "til slutt", "trinn for trinn"] } },
      1: { v: { id: "v9d1", t: "Feilsøking", en: "Debugging & troubleshooting", kw: ["feilsøke", "feil", "bug", "rotårsak", "fikse", "løse"] }, g: { id: "g9d1", t: "Tekniske relative setninger", en: "Tech relative clauses", kw: ["systemet som…", "feilen som…", "tjenesten som…", "der"] } },
      2: { v: { id: "v9d2", t: "Hendelseshåndtering", en: "Incident management", kw: ["hendelse", "alvorlighetsgrad", "eskalering", "postmortem", "beredskap"] }, g: { id: "g9d2", t: "Metodiske setninger", en: "Workflow sentences", kw: ["I hvert tilfelle", "Vi jobber med", "Målet er å"] } },
      3: { v: { id: "v9d3", t: "Ytelse og optimalisering", en: "Performance & optimization", kw: ["ytelse", "flaskehals", "optimalisere", "latens", "gjennomstrømning"] }, g: { id: "g9d3", t: "Kausale setninger – teknisk", en: "Technical causal clauses", kw: ["ved at", "som fører til", "resulterer i", "på grunn av"] } },
      4: { v: { id: "v9d4", t: "Automatisering", en: "Automation & scripting", kw: ["automatisere", "skript", "planlagt oppgave", "cron", "arbeidsflyt"] }, g: { id: "g9d4", t: "Imperativ – profesjonell", en: "Professional imperatives", kw: ["Kjør kommandoen", "Sjekk loggen", "Sørg for at"] } },
      5: { v: { id: "v9d5", t: "Dokumentasjon", en: "Technical documentation", kw: ["dokumentasjon", "wiki", "README", "veiledning", "oppsett"] }, g: { id: "g9d5", t: "Strukturert skriving", en: "Structured writing", kw: ["Innledning", "Bakgrunn", "Fremgangsmåte", "Konklusjon"] } },
      6: null
    }
  },
  10: {
    theme: "Programvareutvikling", focus: "Architecture, APIs, Agile, software engineering", days: {
      0: { v: { id: "v10d0", t: "Programvarearkitektur", en: "Software architecture", kw: ["arkitektur", "mikrotjenester", "backend", "frontend", "design"] }, g: { id: "g10d0", t: "Passiv – forklaringer", en: "Passive in explanations", kw: ["blir brukt", "blir implementert", "blir bygget opp"] } },
      1: { v: { id: "v10d1", t: "APIer og grensesnitt", en: "APIs", kw: ["API", "grensesnitt", "endepunkt", "REST", "forespørsel", "svar"] }, g: { id: "g10d1", t: "Sammensatte substantiv", en: "Compound nouns", kw: ["programvareutvikling", "databasetilkobling", "brukergrensesnitt"] } },
      2: { v: { id: "v10d2", t: "Agile og Scrum", en: "Agile & Scrum", kw: ["Agile", "Scrum", "sprint", "backlog", "standup", "brukerhistorie"] }, g: { id: "g10d2", t: "Tidsuttrykk – avansert", en: "Advanced time expressions", kw: ["i løpet av", "innen", "fra og med", "fortløpende"] } },
      3: { v: { id: "v10d3", t: "Kode og kvalitet", en: "Code & QA", kw: ["kode", "kvalitetssikring", "testing", "enhetstest", "refaktorering"] }, g: { id: "g10d3", t: "Konjunktiv – ville/skulle", en: "Conditional in tech context", kw: ["dette ville", "det skulle", "man kunne", "ideelt sett"] } },
      4: { v: { id: "v10d4", t: "Skalerbarhet", en: "Scaling & performance", kw: ["skalere", "ytelse", "flaskehals", "optimalisere", "belastning"] }, g: { id: "g10d4", t: "Faglig presentasjon", en: "Technical presentation language", kw: ["Jeg vil presentere", "La oss se på", "Som vi kan se"] } },
      5: { v: { id: "v10d5", t: "Versjonskontroll", en: "Version control & Git", kw: ["Git", "versjonskontroll", "gren", "sammenslåing", "commit", "pull request"] }, g: { id: "g10d5", t: "Instruksjonssetninger", en: "Instruction sentences", kw: ["Sørg for at", "Husk å", "Det er viktig å", "Pass på at"] } },
      6: null
    }
  },
  11: {
    theme: "Intervjuforberedelse", focus: "STAR method, mock interviews, salary negotiation", days: {
      0: { v: { id: "v11d0", t: "Jobbintervju", en: "Interview flow", kw: ["jobbintervju", "søknad", "intervjuer", "runde", "forberede"] }, g: { id: "g11d0", t: "Selvpresentasjon", en: "Elevator pitch", kw: ["Jeg er", "Jeg har", "Min erfaring", "Mitt mål er"] } },
      1: { v: { id: "v11d1", t: "Styrker og svakheter", en: "Strengths & weaknesses", kw: ["styrke", "svakhet", "kompetanse", "ferdighet", "spesialisert"] }, g: { id: "g11d1", t: "STAR-metoden", en: "STAR method", kw: ["Situasjon", "Oppgave", "Handling", "Resultat", "Jeg måtte"] } },
      2: { v: { id: "v11d2", t: "Norsk arbeidskultur", en: "Norwegian work culture", kw: ["likestilling", "flat struktur", "du-kultur", "tillitsbasert", "arbeidsmiljøloven"] }, g: { id: "g11d2", t: "Kulturelle forklaringer", en: "Culture explanations", kw: ["I Norge", "Det er vanlig å", "Til forskjell fra"] } },
      3: { v: { id: "v11d3", t: "Tekniske intervjuer", en: "Technical interviews", kw: ["tavle", "utarbeide løsning", "tankeprosess", "forklare kode"] }, g: { id: "g11d3", t: "Tenke høyt", en: "Thinking aloud", kw: ["Jeg tenker at", "Min tilnærming", "Først ville jeg"] } },
      4: { v: { id: "v11d4", t: "Lønnsforhandling", en: "Salary negotiation", kw: ["lønnsforventning", "forhandle", "pakke", "bonus", "fleksibilitet"] }, g: { id: "g11d4", t: "Forhandlingsspråk", en: "Negotiation conditionals", kw: ["Hvis dere kunne", "Ville det vært mulig", "Det kunne jeg akseptere"] } },
      5: { v: { id: "v11d5", t: "Oppfølging", en: "Post-interview follow-up", kw: ["oppfølging", "takkebrev", "tilbud", "akseptere", "avslå"] }, g: { id: "g11d5", t: "Høflige meldinger", en: "Follow-up email patterns", kw: ["Takk for samtalen", "Jeg ser frem til", "Med vennlig hilsen"] } },
      6: null
    }
  },
  12: {
    theme: "Polering og vurdering", focus: "Norskprøven B1 practice, weak areas, final review", days: {
      0: { v: { id: "v12d0", t: "Fylle hull", en: "Filling vocab gaps", kw: ["hull", "supplere", "fullstendiggjøre", "kontekst"] }, g: { id: "g12d0", t: "Svake punkter", en: "Drilling weak spots", kw: ["svakt punkt", "fordype", "fokus", "målrettet øvelse"] } },
      1: { v: { id: "v12d1", t: "Prøvevokabular", en: "Exam vocabulary", kw: ["prøve", "oppgave", "instruksjon", "lese", "skrive"] }, g: { id: "g12d1", t: "Prøvestrategier", en: "Exam strategies", kw: ["strategi", "eliminering", "tidsstyring"] } },
      2: { v: { id: "v12d2", t: "Generell repetisjon", en: "General vocab review", kw: ["repetisjon", "styrke", "kjerneordforråd"] }, g: { id: "g12d2", t: "Hurtigøvelser", en: "Speed drill (all grammar)", kw: ["raskt", "blandet", "alle typer", "nøyaktighet"] } },
      3: { v: { id: "v12d3", t: "Snakkeøvelser", en: "Full speaking practice", kw: ["snakke", "monolog", "dialog", "simulere"] }, g: { id: "g12d3", t: "Spontane setninger", en: "Spontaneous sentences", kw: ["spontan", "danne setning", "uten forberedelse", "flytende"] } },
      4: { v: { id: "v12d4", t: "Skriveøvelser", en: "Full writing practice", kw: ["skrive", "brev", "mening", "sammenhengende"] }, g: { id: "g12d4", t: "Tekstsammenheng", en: "Text coherence", kw: ["sammenhengende", "overgang", "dessuten", "i forlengelsen av"] } },
      5: { v: { id: "v12d5", t: "Siste forberedelse", en: "Final prep", kw: ["forberedt", "tillit", "suksess", "klar"] }, g: { id: "g12d5", t: "Lynøvelse – totalt", en: "Flash review all", kw: ["lyn", "alle", "totaløvelse", "endelig"] } },
      6: null
    }
  },
};

const DAY_LAYOUT = [
  { day: "Mon", type: "heavy" }, { day: "Tue", type: "heavy" }, { day: "Wed", type: "light" },
  { day: "Thu", type: "heavy" }, { day: "Fri", type: "heavy" }, { day: "Sat", type: "light" },
  { day: "Sun", type: "review" }
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function phaseFor(w) { return PHASES.find(p => p.weeks.includes(w)) || PHASES[0]; }

function topicsBefore(week, day, states) {
  const done = [], skipped = [];
  for (let w = 1; w <= 12; w++) {
    const wd = CUR[w]; if (!wd) continue;
    for (let d = 0; d <= 5; d++) {
      if (w === week && d >= day) break;
      const dd = wd.days[d]; if (!dd) continue;
      ["v", "g"].forEach(k => {
        const t = dd[k]; if (!t) return;
        if (states[t.id] === "done") done.push(t);
        if (states[t.id] === "skip") skipped.push(t);
      });
    }
    if (w === week) break;
  }
  return { done, skipped };
}

function buildPrompt(week, dayIdx, states) {
  const phase = phaseFor(week), wd = CUR[week], layout = DAY_LAYOUT[dayIdx];
  const dd = wd.days[dayIdx], isReview = dayIdx === 6, isLight = layout.type === "light";
  const { done, skipped } = topicsBefore(week, dayIdx, states);
  const L = [];
  L.push(`=== NORWEGIAN B1 DAILY LESSON PLAN ===`);
  L.push(`Week ${week} · Day ${dayIdx + 1} (${layout.day}) · ${isLight ? "Light Day (mobile-friendly)" : isReview ? "Weekly Review" : "Full PC Day"}`);
  L.push(`Phase: ${phase.label} — ${phase.subtitle}`);
  L.push(`Week Theme: ${wd.theme} — ${wd.focus}\n`);

  if (!isReview && dd) {
    L.push(`--- TODAY'S NEW TOPICS ---`);
    if (dd.v) { L.push(`[VOCAB] ${dd.v.t} (${dd.v.en}) — Status: ${states[dd.v.id] || "pending"}`); L.push(`  Keywords: ${dd.v.kw.join(", ")}`); }
    if (dd.g) { L.push(`[GRAMMAR] ${dd.g.t} (${dd.g.en}) — Status: ${states[dd.g.id] || "pending"}`); L.push(`  Focus: ${dd.g.kw.join(", ")}`); }
    L.push(``);
  }

  L.push(`--- SESSION STRUCTURE ---`);
  if (isReview) {
    L.push(`S1 (1 hr): Weekly assessment — quiz all topics from Week ${week}. Test recall, not recognition.`);
    L.push(`S2 (30 min): Identify weak spots. Note what to revisit next week.`);
  } else if (isLight) {
    L.push(`S1 (35 min): Anki review of today's keywords. Listen to "Klar Tale" or "NRK Nyheter" — note relevant words.`);
    L.push(`S2 (35 min): 5 fill-in-the-blank sentences for today's grammar. No essays — just targeted drills.`);
  } else {
    L.push(`S1 (1h 15min): Learn today's vocab + grammar. Generate 8–10 exercises (fill-in, sentence construction, short paragraph). Reference NTNU Learn Norwegian or NRK Norskkurs if relevant.`);
    L.push(`S2 (1h 15min): Write a short text (5–7 sentences) using today's vocab + grammar. Prepare 3 tandem conversation prompts. Run text through LanguageTool.`);
  }
  L.push(`S3 (30 min): DAILY REFRESHER — see below.\n`);

  // ── Refresher ──
  L.push(`--- SESSION 3: DAILY REFRESHER (30 min) ---`);
  L.push(`Spaced repetition on ALL previously completed topics. Do NOT repeat today's new topics here.`);
  if (done.length === 0) {
    L.push(`(No previous topics yet — skip or use for free writing practice.)`);
  } else {
    L.push(`Previously completed topics (prioritise the OLDEST for spaced repetition):`);
    done.forEach((t, i) => L.push(`  ${i + 1}. ${t.t} — kw: ${t.kw.slice(0, 4).join(", ")}`));
    L.push(`\nRefresher structure:`);
    L.push(`  • 5 vocab recall questions (from the oldest 3–4 topics above)`);
    L.push(`  • 3 grammar fill-in-the-blank (mix of grammar topics from above)`);
    L.push(`  • 1 writing prompt (3–4 sentences) combining vocab from at least 2 different previous topics`);
  }
  L.push(``);

  if (skipped.length > 0) {
    L.push(`--- SKIPPED TOPICS (exclude from all exercises) ---`);
    skipped.forEach(t => L.push(`  • ${t.t} (${t.en})`));
    L.push(``);
  }

  L.push(`--- INSTRUCTIONS ---`);
  L.push(`Generate the full detailed plan. Include all exercises with exact instructions.`);
  L.push(`For vocab: Norwegian word + English meaning + example sentence.`);
  L.push(`For grammar: brief rule explanation, then 5–8 targeted exercises.`);
  L.push(`For the refresher: actually write out the specific questions and prompts — don't describe them generically.`);
  return L.join("\n");
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const SK = "norwegian_b1_v1";
function load() { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : { ts: {}, dd: {} }; } catch { return { ts: {}, dd: {} }; } }
function save(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) { console.error(e); } }

// ─── TOPIC CHIP ──────────────────────────────────────────────────────────────
function TopicChip({ topic, state, onToggle, C }) {
  const isV = topic.id.startsWith("v");
  const col = isV ? C.green : C.blue;
  const bg = state === "done" ? col.light + "33" : C.surfaceHi;
  const border = state === "done" ? col.mid : state === "skip" ? C.textDim : C.border;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "6px 8px", opacity: state === "skip" ? 0.45 : 1, transition: "all 0.2s" }}>
      <span style={{ fontSize: 9, fontWeight: 700, background: col.mid, color: "#fff", borderRadius: 4, padding: "2px 5px", textTransform: "uppercase" }}>{isV ? "Vocab" : "Grammar"}</span>
      <span style={{ color: state === "done" ? col.mid : C.text, fontSize: 12, fontWeight: 600, flex: 1 }}>{topic.t}</span>
      <span style={{ color: C.textDim, fontSize: 10, marginRight: 4 }}>{topic.en}</span>
      <button onClick={() => onToggle(topic.id, "done")} style={{ width: 22, height: 22, borderRadius: 5, border: "none", background: state === "done" ? col.mid : C.border, color: state === "done" ? "#fff" : C.textDim, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>✓</button>
      <button onClick={() => onToggle(topic.id, "skip")} style={{ width: 22, height: 22, borderRadius: 5, border: "none", background: state === "skip" ? C.red.mid : C.border, color: state === "skip" ? "#fff" : C.textDim, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>✕</button>
    </div>
  );
}

// ─── DAY CARD ────────────────────────────────────────────────────────────────
function DayCard({ weekNum, dayIdx, topicStates, daysDone, onDayToggle, onTopicToggle, C }) {
  const [open, setOpen] = useState(false);
  const [showP, setShowP] = useState(false);
  const [copied, setCopied] = useState(false);
  const layout = DAY_LAYOUT[dayIdx], phase = phaseFor(weekNum);
  const dd = CUR[weekNum]?.days[dayIdx];
  const isReview = dayIdx === 6, isLight = layout.type === "light";
  const isDone = !!(daysDone[weekNum] && daysDone[weekNum][dayIdx]);
  const topics = []; if (dd) { if (dd.v) topics.push(dd.v); if (dd.g) topics.push(dd.g); }
  const prompt = buildPrompt(weekNum, dayIdx, topicStates);

  return (
    <div style={{ background: isDone ? phase.color.light + "12" : C.surface, border: `1px solid ${isDone ? phase.color.mid + "44" : C.border}`, borderRadius: 12, overflow: "hidden", transition: "all 0.2s" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 8, cursor: "pointer", userSelect: "none" }} onClick={() => setOpen(!open)}>
        <span style={{ fontSize: 17 }}>{isLight ? "📱" : isReview ? "📊" : "💻"}</span>
        <div style={{ flex: 1 }}>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{layout.day}</span>
          <span style={{ color: C.textDim, fontSize: 9, marginLeft: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{layout.type === "heavy" ? "Full PC" : layout.type === "light" ? "Light / Mobile" : "Review"}</span>
        </div>
        {!isReview && topics.length > 0 && <span style={{ color: C.textDim, fontSize: 10, textAlign: "right", maxWidth: 180, lineHeight: 1.3 }}>{topics.map(t => t.t).join(" · ")}</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={e => { e.stopPropagation(); onDayToggle(weekNum, dayIdx); }} style={{ width: 24, height: 24, borderRadius: 6, border: isDone ? `2px solid ${phase.color.mid}` : `2px solid ${C.border}`, background: isDone ? phase.color.mid : "transparent", color: isDone ? "#fff" : C.textDim, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{isDone ? "✓" : ""}</button>
          <span style={{ color: C.textDim, fontSize: 13 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* body */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* topics */}
          {!isReview ? topics.map(t => <TopicChip key={t.id} topic={t} state={topicStates[t.id] || "pending"} onToggle={onTopicToggle} C={C} />) : <div style={{ color: C.textMute, fontSize: 12, fontStyle: "italic" }}>Review day — no new topics. Assess all Week {weekNum} topics.</div>}

          {/* sessions summary */}
          <div style={{ background: C.surfaceHi, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ color: C.textMute, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Sessions</div>
            <div style={{ color: C.textDim, fontSize: 11, lineHeight: 1.8 }}>
              {isLight ? <>{`S1 (35 min) Anki + podcast`}<br />{`S2 (35 min) Light grammar drill`}<br />{`S3 (30 min) Daily Refresher ↻`}</>
                : isReview ? <>{`S1 (1 hr)   Weekly assessment`}<br />{`S2 (30 min) Weak area planning`}<br />{`S3 (30 min) Daily Refresher ↻`}</>
                  : <>{`S1 (1h 15m) New material + exercises`}<br />{`S2 (1h 15m) Writing + tandem prep`}<br />{`S3 (30 min) Daily Refresher ↻`}</>}
            </div>
          </div>

          {/* generate button */}
          <button onClick={() => { setShowP(!showP); setCopied(false); }} style={{ background: phase.color.light + "18", border: `1px solid ${phase.color.light}44`, borderRadius: 8, color: phase.color.mid, fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer" }}>
            {showP ? "▲ Hide Prompt" : "📋 Generate & Copy Today's Plan"}
          </button>

          {/* prompt box */}
          {showP && (
            <div style={{ background: C.promptBg, border: `1px solid ${phase.color.light}33`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: phase.color.mid, fontSize: 11, fontWeight: 700 }}>Paste this into a new Claude chat →</span>
                <button onClick={() => { navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1800); }} style={{ background: phase.color.mid, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", cursor: "pointer" }}>{copied ? "Copied ✓" : "Copy"}</button>
              </div>
              <pre style={{ color: C.textMute, fontSize: 11, margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 300, overflowY: "auto", fontFamily: "'Sora',sans-serif" }}>{prompt}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [week, setWeek] = useState(1);
  const [ts, setTs] = useState({});   // topicStates
  const [dd, setDd] = useState({});   // daysDone
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("nb1_dark") === "1"; } catch { return false; }
  });
  const [loading, setLoading] = useState(true);

  const C = dark ? DARK : LIGHT;

  useEffect(() => { const s = load(); setTs(s.ts || {}); setDd(s.dd || {}); setLoading(false); }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("nb1_dark", next ? "1" : "0"); } catch {}
  };

  const persist = useCallback((a, b) => save({ ts: a, dd: b }), []);

  const toggleTopic = (id, newState) => {
    const next = { ...ts, [id]: ts[id] === newState ? "pending" : newState };
    setTs(next); persist(next, dd);
  };
  const toggleDay = (w, d) => {
    const next = { ...dd, [w]: { ...(dd[w] || {}), [d]: !(dd[w]?.[d]) } };
    setDd(next); persist(ts, next);
  };

  // stats
  let totalTopics = 0;
  for (let w = 1; w <= 12; w++) { const days = CUR[w].days; for (let d = 0; d <= 5; d++) if (days[d]) totalTopics += 2; }
  const doneT = Object.values(ts).filter(s => s === "done").length;
  const skipT = Object.values(ts).filter(s => s === "skip").length;
  const totalDays = 84;
  const doneD = Object.values(dd).reduce((a, w) => a + Object.values(w).filter(Boolean).length, 0);
  const phase = phaseFor(week);

  if (loading) return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMute, fontFamily: "'Sora',sans-serif" }}>Loading…</div>;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", transition: "background 0.3s" }}>
    <div style={{ color: C.text, fontFamily: "'Sora',sans-serif", padding: "24px 18px", maxWidth: 740, margin: "0 auto", transition: "color 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        ::selection { background: ${dark ? "#3a3a5e" : "#b3d4fc"}; color: ${dark ? "#fff" : "#1a1a2e"}; }
        body { margin: 0; background: ${C.bg}; transition: background 0.3s; }
      `}</style>

      {/* title */}
      <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.text }}>🇳🇴 Norwegian B1 Tracker <span style={{ fontSize: 13, fontWeight: 500, color: C.textDim }}>v1</span></h1>
          <p style={{ margin: "3px 0 0", color: C.textDim, fontSize: 11 }}>Unique topics every day · stateful refresher · no repetition · progress saved</p>
        </div>
        <button onClick={toggleDark} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 2, transition: "all 0.2s" }} title={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☀️" : "🌙"}</button>
      </div>

      {/* stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Days Done", val: `${doneD} / ${totalDays}`, pct: doneD / totalDays, col: C.green },
          { label: "Topics Done", val: `${doneT} / ${totalTopics}`, pct: doneT / totalTopics, col: C.blue },
          { label: "Topics Skipped", val: `${skipT}`, pct: 0, col: C.red },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 11px" }}>
            <div style={{ color: C.textDim, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{s.label}</div>
            <div style={{ color: C.text, fontSize: 17, fontWeight: 800 }}>{s.val}</div>
            {i < 2 && <div style={{ background: C.surfaceHi, borderRadius: 10, height: 4, marginTop: 5, overflow: "hidden" }}><div style={{ width: `${s.pct * 100}%`, height: "100%", background: s.col.mid, borderRadius: 10, transition: "width 0.4s" }} /></div>}
          </div>
        ))}
      </div>

      {/* phase nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {PHASES.map(p => {
          const active = p.weeks.includes(week);
          return <button key={p.id} onClick={() => setWeek(p.weeks[0])} style={{ flex: "1 1 110px", padding: "7px 9px", borderRadius: 8, border: active ? `2px solid ${p.color.mid}` : `1px solid ${C.border}`, background: active ? p.color.light + "18" : C.surface, color: active ? p.color.mid : C.textMute, fontFamily: "inherit", fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <div style={{ fontSize: 8, opacity: 0.55, textTransform: "uppercase", letterSpacing: 0.8 }}>Phase {p.id}</div>
            <div style={{ fontWeight: 700 }}>{p.label}</div>
          </button>;
        })}
      </div>

      {/* week selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ color: phase.color.mid, fontSize: 19, fontWeight: 800 }}>Week {week}</span>
          <span style={{ color: C.textMute, fontSize: 13, fontWeight: 600 }}>— {CUR[week].theme}</span>
        </div>
        <p style={{ margin: "0 0 8px", color: C.textDim, fontSize: 11 }}>{CUR[week].focus}</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[...Array(12)].map((_, i) => {
            const w = i + 1, p = phaseFor(w);
            const allDone = dd[w] && Object.keys(dd[w]).filter(k => dd[w][k]).length === 7;
            return <button key={w} onClick={() => setWeek(w)} style={{ width: 32, height: 32, borderRadius: 7, border: w === week ? `2px solid ${p.color.mid}` : "1px solid " + C.border, background: allDone ? p.color.light + "44" : w === week ? p.color.light + "18" : C.surface, color: w === week ? p.color.mid : allDone ? p.color.mid : C.textMute, fontWeight: w === week || allDone ? 700 : 400, fontSize: 12, cursor: "pointer", position: "relative", fontFamily: "inherit" }}>{w}{allDone && <span style={{ position: "absolute", top: -5, right: -5, fontSize: 9 }}>✅</span>}</button>;
          })}
        </div>
      </div>

      {/* day cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {DAY_LAYOUT.map((_, i) => <DayCard key={i} weekNum={week} dayIdx={i} topicStates={ts} daysDone={dd} onDayToggle={toggleDay} onTopicToggle={toggleTopic} C={C} />)}
      </div>

      {/* legend */}
      <div style={{ marginTop: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px" }}>
        <div style={{ color: C.blue.mid, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>💡 How it works</div>
        <div style={{ color: C.textDim, fontSize: 11, lineHeight: 1.85 }}>
          1. Expand a day → see its <strong style={{ color: C.text }}>unique vocab + grammar topics</strong>.<br />
          2. Mark topics <strong style={{ color: C.green.mid }}>✓ done</strong> after learning, or <strong style={{ color: C.red.mid }}>✕ skip</strong> if already known.<br />
          3. Tap <strong style={{ color: C.text }}>Generate & Copy</strong> — the prompt carries your <em>full topic history</em>, so Claude never repeats anything.<br />
          4. <strong style={{ color: C.text }}>Session 3 (Refresher)</strong> auto-pulls from all your previously done topics for spaced repetition.<br />
          5. Tick the day ✓ when all 3 sessions are complete.
        </div>
      </div>
    </div>
    </div>
  );
}
