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

// ─── LEARNING MODES ──────────────────────────────────────────────────────────
const MODES = {
  skriftlig:     { id: "skriftlig",     label: "Skriftlig",     en: "Writing",         icon: "✍️",    ratio: "100% written" },
  blandet:       { id: "blandet",       label: "Blandet",       en: "Mixed",           icon: "✍️🗣️", ratio: "50/50 written & spoken" },
  muntlig_fokus: { id: "muntlig_fokus", label: "Muntlig-fokus", en: "Speaking-focused", icon: "🗣️",   ratio: "75% spoken, 25% written" },
  muntlig:       { id: "muntlig",       label: "Muntlig",       en: "Full oral",       icon: "🎤",    ratio: "100% spoken" },
};

const PHASES = [
  { id: 1, label: "Foundation", subtitle: "Skriftlig (Writing)", weeks: [1, 2, 3], color: SHARED.green, mode: "skriftlig" },
  { id: 2, label: "Helse + Bolig + Kultur", subtitle: "Blandet (Mixed)", weeks: [4, 5, 6], color: SHARED.blue, mode: "blandet" },
  { id: 3, label: "Samfunn + Diskusjon", subtitle: "Muntlig-fokus", weeks: [7, 8, 9], color: SHARED.purple, mode: "muntlig_fokus" },
  { id: 4, label: "Tech + Intervju + Eksamen", subtitle: "Muntlig (Full oral)", weeks: [10, 11, 12], color: SHARED.gold, mode: "muntlig" },
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
    theme: "Helse og velvære", focus: "Health, doctor visits, body, pharmacy, lifestyle, exercise", days: {
      0: { v: { id: "v4d0", t: "Hos legen", en: "At the doctor", kw: ["lege", "pasient", "time", "undersøkelse", "resept", "sykmelding"] }, g: { id: "g4d0", t: "Passiv – utvidet", en: "Passive expanded", kw: ["ble undersøkt", "er blitt behandlet", "kan foreskrives"] } },
      1: { v: { id: "v4d1", t: "Kropp og symptomer", en: "Body & symptoms", kw: ["hode", "mage", "rygg", "feber", "vondt", "smerter", "kvalm"] }, g: { id: "g4d1", t: "Presens partisipp som adjektiv", en: "Participle as adjective", kw: ["den smertende armen", "det hovne kneet", "en blødende finger"] } },
      2: { v: { id: "v4d2", t: "Apotek og medisin", en: "Pharmacy & medicine", kw: ["apotek", "medisin", "tablett", "resept", "bivirkning", "dose", "allergi"] }, g: { id: "g4d2", t: "Modale verb – fortid", en: "Modal verbs past", kw: ["måtte ta medisin", "kunne ikke sove", "skulle til legen", "ville bli frisk"] } },
      3: { v: { id: "v4d3", t: "Sunn livsstil", en: "Healthy lifestyle", kw: ["sunt", "kosthold", "trene", "søvn", "stress", "vaner", "helse-app"] }, g: { id: "g4d3", t: "Preposisjoner – sted", en: "Prepositions of place", kw: ["på sykehuset", "hos legen", "i apoteket", "ved siden av", "foran", "bak"] } },
      4: { v: { id: "v4d4", t: "Psykisk helse", en: "Mental health", kw: ["psykisk", "angst", "depresjon", "terapi", "støtte", "mindfulness", "trivsel"] }, g: { id: "g4d4", t: "Eiendomsord og genitiv", en: "Possessives & genitive", kw: ["min helse", "legens råd", "hans symptomer", "hennes behandling", "-s genitiv"] } },
      5: { v: { id: "v4d5", t: "Trening og sport", en: "Exercise & sports", kw: ["trene", "løpe", "svømme", "fotball", "ski", "treningssenter", "tur"] }, g: { id: "g4d5", t: "Tidssetninger – da/når", en: "Temporal clauses", kw: ["da jeg ble syk", "når man trener", "mens jeg ventet", "etter at"] } },
      6: null
    }
  },
  5: {
    theme: "Bolig og nærmiljø", focus: "Housing, renting, home description, neighborhood, moving", days: {
      0: { v: { id: "v5d0", t: "Boligtyper", en: "Types of housing", kw: ["leilighet", "hus", "hybel", "rekkehus", "blokk", "etasje", "rom"] }, g: { id: "g5d0", t: "Formelt vs. uformelt", en: "Formal vs informal", kw: ["De", "du", "Kjære utleier", "Hei", "Med vennlig hilsen"] } },
      1: { v: { id: "v5d1", t: "Leie og kontrakt", en: "Renting & contracts", kw: ["leie", "utleier", "leietaker", "depositum", "kontrakt", "oppsigelse", "husleie"] }, g: { id: "g5d1", t: "Høflige forespørsler", en: "Polite requests", kw: ["Kunne jeg få se leiligheten", "Ville det vært mulig", "vær så snill", "det hadde vært fint"] } },
      2: { v: { id: "v5d2", t: "Beskrive hjemmet", en: "Describing your home", kw: ["stue", "kjøkken", "soverom", "bad", "møbler", "innredning", "koselig"] }, g: { id: "g5d2", t: "Konnektorer", en: "Connectors", kw: ["likevel", "dessuten", "allikevel", "derfor", "på den ene siden", "på den andre siden"] } },
      3: { v: { id: "v5d3", t: "Nabolag og tjenester", en: "Neighborhood & services", kw: ["nabolag", "matbutikk", "skole", "park", "busstopp", "bibliotek", "Finn.no"] }, g: { id: "g5d3", t: "Passiv i tale", en: "Passive in spoken language", kw: ["ble bygget", "er blitt renovert", "blir vedlikeholdt"] } },
      4: { v: { id: "v5d4", t: "Flytte", en: "Moving", kw: ["flytte", "pakke", "adresseendring", "Posten", "folkeregisteret", "nøkkel", "innflytting"] }, g: { id: "g5d4", t: "Strukturord – beskrivelse", en: "Structuring descriptions", kw: ["for det første", "for det andre", "for eksempel", "til slutt"] } },
      5: { v: { id: "v5d5", t: "Hjem og vedlikehold", en: "Home & maintenance", kw: ["reparere", "vaske", "rengjøre", "dugnad", "vaktmester", "smarthjem", "oppussing"] }, g: { id: "g5d5", t: "Sammensatte setninger", en: "Compound sentences", kw: ["den nyoppussede leiligheten", "det velholdte nabolaget", "en romslig stue"] } },
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
    theme: "Handel, tjenester og reise", focus: "Shopping, banking, public services, restaurants, travel, transport", days: {
      0: { v: { id: "v7d0", t: "Handle og butikker", en: "Shopping & stores", kw: ["butikk", "handle", "pris", "tilbud", "kasse", "kvittering", "nettbutikk"] }, g: { id: "g7d0", t: "Strukturere tekst", en: "Structuring text", kw: ["for det første", "i tillegg", "i denne sammenhengen", "dessuten"] } },
      1: { v: { id: "v7d1", t: "Bank og økonomi", en: "Banking & money", kw: ["bank", "konto", "overføring", "lån", "rente", "Vipps", "nettbank"] }, g: { id: "g7d1", t: "Passiv i formelt språk", en: "Passive in formal language", kw: ["ble overført", "er blitt godkjent", "kan betales"] } },
      2: { v: { id: "v7d2", t: "Offentlige tjenester", en: "Public services", kw: ["NAV", "skatteetaten", "folkeregisteret", "Posten", "kommune", "BankID"] }, g: { id: "g7d2", t: "Handlingsverb", en: "Action verb phrases", kw: ["søke om", "melde fra", "registrere seg", "levere inn", "fylle ut"] } },
      3: { v: { id: "v7d3", t: "Restaurant og kafé", en: "Restaurants & cafes", kw: ["meny", "bestille", "regning", "tips", "servitør", "vegetar", "allergier"] }, g: { id: "g7d3", t: "Formålssetninger – for å/slik at", en: "Purpose clauses", kw: ["for å bestille", "slik at vi rekker", "med formål om", "hensikt"] } },
      4: { v: { id: "v7d4", t: "Reise og transport", en: "Travel & transport", kw: ["tog", "buss", "fly", "billett", "reise", "bagasje", "forsinkelse", "Ruter"] }, g: { id: "g7d4", t: "Sammenligningsstrukturer", en: "Comparison structures", kw: ["billigere enn", "raskere enn", "den beste ruten", "sammenlignet med"] } },
      5: { v: { id: "v7d5", t: "Bestilling og veibeskrivelse", en: "Booking & directions", kw: ["bestille", "reservere", "rett fram", "ta til venstre", "holdeplass", "avgang"] }, g: { id: "g7d5", t: "Konklusjonssetninger", en: "Conclusion patterns", kw: ["Alt i alt", "Oppsummert", "Det følger av", "Konklusjonen er"] } },
      6: null
    }
  },
  8: {
    theme: "Familie, utdanning og fritid", focus: "Family, relationships, education, hobbies, entertainment, social life", days: {
      0: { v: { id: "v8d0", t: "Familie og relasjoner", en: "Family & relationships", kw: ["familie", "foreldre", "søsken", "barn", "ektefelle", "samboer", "slektning"] }, g: { id: "g8d0", t: "Argumentasjonsstruktur", en: "Argumentation structure", kw: ["påstand", "begrunnelse", "eksempel", "motargument", "konklusjon"] } },
      1: { v: { id: "v8d1", t: "Utdanning og skole", en: "Education & school", kw: ["skole", "universitet", "fag", "eksamen", "karakter", "studere", "lærling"] }, g: { id: "g8d1", t: "Konjunksjoner – avansert", en: "Advanced conjunctions", kw: ["enten…eller", "verken…eller", "både…og", "jo…desto"] } },
      2: { v: { id: "v8d2", t: "Hobbyer og sport", en: "Hobbies & sports", kw: ["hobby", "fotball", "ski", "lese", "spille", "trene", "friluftsliv"] }, g: { id: "g8d2", t: "Setningsadverbialer", en: "Sentence adverbials", kw: ["dessverre", "heldigvis", "sannsynligvis", "tydeligvis", "selvfølgelig"] } },
      3: { v: { id: "v8d3", t: "Underholdning og medier", en: "Entertainment & media", kw: ["film", "serie", "musikk", "konsert", "teater", "strømming", "podcast"] }, g: { id: "g8d3", t: "Forklarende strukturer", en: "Explanatory sentences", kw: ["det betyr at", "det vil si", "med det mener jeg", "nemlig"] } },
      4: { v: { id: "v8d4", t: "Sosialt liv", en: "Social life", kw: ["venn", "selskap", "invitere", "feire", "småprat", "avtale", "hygge"] }, g: { id: "g8d4", t: "Betingelsessetninger – hvis/dersom", en: "Conditional sentences", kw: ["hvis", "dersom", "i tilfelle", "forutsatt at", "med mindre"] } },
      5: { v: { id: "v8d5", t: "Høytider og feiring", en: "Holidays & celebrations", kw: ["jul", "påske", "17. mai", "bursdag", "bryllup", "nyttår", "tradisjon"] }, g: { id: "g8d5", t: "Refererende setninger", en: "Referencing & quoting", kw: ["ifølge", "som nevnt", "det hevdes at", "med henvisning til"] } },
      6: null
    }
  },
  9: {
    theme: "Diskusjoner og aktuelle temaer", focus: "Current events, persuasion, critical thinking, debates, social media", days: {
      0: { v: { id: "v9d0", t: "Aktuelle hendelser", en: "Current events", kw: ["hendelse", "politikk", "økonomi", "klima", "debatt", "innvandring"] }, g: { id: "g9d0", t: "Prosessbeskrivelse", en: "Step-by-step description", kw: ["først", "deretter", "så", "til slutt", "trinn for trinn"] } },
      1: { v: { id: "v9d1", t: "Overbevisende språk", en: "Persuasive language", kw: ["overbevise", "innlysende", "plausibel", "logisk", "bevis", "argument"] }, g: { id: "g9d1", t: "Avanserte relativsetninger", en: "Advanced relative clauses", kw: ["saken som…", "personen som…", "problemet som…", "der"] } },
      2: { v: { id: "v9d2", t: "Kritisk tenkning", en: "Critical thinking", kw: ["stille spørsmål", "analysere", "vurdere", "reflektere", "perspektiv"] }, g: { id: "g9d2", t: "Metodiske setninger", en: "Methodology sentences", kw: ["I hvert tilfelle", "Vi kan se at", "Målet er å", "Det viser seg at"] } },
      3: { v: { id: "v9d3", t: "Hverdagssamtaler", en: "Everyday conversations", kw: ["småprat", "vær", "helg", "planer", "ferie", "nyheter"] }, g: { id: "g9d3", t: "Kausale setninger", en: "Advanced causal clauses", kw: ["ved at", "som fører til", "resulterer i", "på grunn av"] } },
      4: { v: { id: "v9d4", t: "Konfliktløsning", en: "Conflict resolution", kw: ["konflikt", "løse", "kompromiss", "forståelse", "mekle", "enighet"] }, g: { id: "g9d4", t: "Imperativ – profesjonell", en: "Professional imperatives", kw: ["Tenk over", "Vurder å", "Sørg for at", "Husk å"] } },
      5: { v: { id: "v9d5", t: "Sosiale medier og debatt", en: "Social media & debate", kw: ["sosiale medier", "debatt", "ytringsfrihet", "personvern", "digital", "innhold"] }, g: { id: "g9d5", t: "Strukturert muntlig forklaring", en: "Structured verbal explanation", kw: ["Først vil jeg forklare", "Bakgrunnen er", "Poenget mitt er", "Konklusjonen min er"] } },
      6: null
    }
  },
  10: {
    theme: "Teknologi i hverdagen og på jobb", focus: "Technology in daily life, workplace communication, IT, DevOps overview, digital society", days: {
      0: { v: { id: "v10d0", t: "Datamaskin og internett", en: "Computers & internet in daily life", kw: ["datamaskin", "internett", "nettleser", "app", "oppdatering", "passord", "sky"] }, g: { id: "g10d0", t: "Passiv – forklaringer", en: "Passive in explanations", kw: ["blir brukt", "blir implementert", "ble opprettet"] } },
      1: { v: { id: "v10d1", t: "E-post, møter og presentasjoner", en: "Email, meetings & presentations", kw: ["e-post", "møte", "presentasjon", "dagsorden", "referat", "foredrag", "vedlegg"] }, g: { id: "g10d1", t: "Sammensatte substantiv", en: "Compound nouns", kw: ["programvareutvikling", "arbeidsoppgave", "brukergrensesnitt", "sikkerhetskopi"] } },
      2: { v: { id: "v10d2", t: "Programvare og utvikling", en: "Software & development", kw: ["programvare", "kode", "Agile", "testing", "API", "versjonskontroll", "feilsøking"] }, g: { id: "g10d2", t: "Tidsuttrykk – avansert", en: "Advanced time expressions", kw: ["i løpet av", "innen", "fra og med", "fortløpende"] } },
      3: { v: { id: "v10d3", t: "DevOps og skyløsninger", en: "DevOps & cloud", kw: ["DevOps", "sky", "Docker", "pipeline", "automatisering", "overvåking", "deploy"] }, g: { id: "g10d3", t: "Konjunktiv – ville/skulle", en: "Conditional (hypothetical)", kw: ["dette ville", "det skulle", "man kunne", "ideelt sett"] } },
      4: { v: { id: "v10d4", t: "Digitalt samfunn", en: "Digital society", kw: ["digitalisering", "personvern", "kunstig intelligens", "IT-sikkerhet", "BankID", "Altinn"] }, g: { id: "g10d4", t: "Faglig presentasjon", en: "Technical presentation language", kw: ["Jeg vil presentere", "La oss se på", "Som vi kan se"] } },
      5: { v: { id: "v10d5", t: "Forklare teknisk på norsk", en: "Explaining tech in Norwegian", kw: ["forklare", "beskrive", "oppsummere", "presentere løsning", "tankeprosess"] }, g: { id: "g10d5", t: "Instruksjonssetninger", en: "Instruction sentences", kw: ["Sørg for at", "Husk å", "Det er viktig å", "Pass på at"] } },
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
    theme: "Muntlig eksamensforberedelse", focus: "Norskprøven B1 muntlig simulation, weak areas, final oral review", days: {
      0: { v: { id: "v12d0", t: "Fylle hull", en: "Filling vocab gaps", kw: ["hull", "supplere", "fullstendiggjøre", "kontekst"] }, g: { id: "g12d0", t: "Svake punkter", en: "Drilling weak spots", kw: ["svakt punkt", "fordype", "fokus", "målrettet øvelse"] } },
      1: { v: { id: "v12d1", t: "Muntlig prøvevokabular", en: "Exam speaking vocabulary", kw: ["prøve", "samtale", "monolog", "diskusjon", "mening"] }, g: { id: "g12d1", t: "Prøvestrategier", en: "Oral exam strategies", kw: ["strategi", "tidsbruk", "struktur i tale", "fyllord"] } },
      2: { v: { id: "v12d2", t: "Samtalefraser", en: "Conversational phrases review", kw: ["repetisjon", "fraser", "overganger", "meningsuttrykk"] }, g: { id: "g12d2", t: "Muntlige hurtigøvelser", en: "Speed speaking drill (all grammar)", kw: ["raskt", "muntlig", "alle typer", "flyt"] } },
      3: { v: { id: "v12d3", t: "Snakkeøvelser", en: "Full speaking practice", kw: ["snakke", "monolog", "dialog", "simulere"] }, g: { id: "g12d3", t: "Spontane setninger", en: "Spontaneous sentences", kw: ["spontan", "danne setning", "uten forberedelse", "flytende"] } },
      4: { v: { id: "v12d4", t: "Muntlig eksamenssimulering", en: "Full mock muntlig exam", kw: ["muntlig prøve", "simulering", "par-diskusjon", "monolog", "rollespill"] }, g: { id: "g12d4", t: "Muntlig sammenheng", en: "Spoken coherence", kw: ["sammenhengende tale", "overgangsord", "dessuten", "i tillegg"] } },
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
function modeFor(w) { return MODES[phaseFor(w).mode]; }

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

// ─── PROMPT BUILDER (mode-aware) ─────────────────────────────────────────────
const MODE_HEADERS = {
  skriftlig: "SKRIFTLIG (WRITING)",
  blandet: "BLANDET (MIXED WRITING + SPEAKING)",
  muntlig_fokus: "MUNTLIG-FOKUS (SPEAKING-FOCUSED)",
  muntlig: "MUNTLIG (ORAL)",
};
const S3_LABELS = {
  skriftlig: "WRITTEN REFRESHER",
  blandet: "MIXED REFRESHER",
  muntlig_fokus: "ORAL REFRESHER",
  muntlig: "ORAL REFRESHER",
};

function buildSessionStructure(mode, L) {
  const m = mode.id;
  if (m === "skriftlig") {
    L.push(`S1 (1h 15min): Learn today's vocab + grammar with WRITING-FIRST exercises. Generate 8–10 written drills: write sentences using new vocab, fill-in-the-blank exercises, construct short paragraphs using new grammar, translate English→Norwegian sentences. Reference NTNU Learn Norwegian or NRK Norskkurs if relevant.`);
    L.push(`S2 (1h 15min): WRITTEN THINKING PRACTICE — This session builds the thinking patterns you'll need for speaking later. Generate: (a) one WRITTEN OPINION PIECE — give a discussion question related to today's topic, the learner writes their position (80–120 words) with arguments for AND against, using connectors like "fordi", "på den ene siden", "dessuten", "likevel"; (b) one WRITTEN PAIRED DISCUSSION — write out a realistic two-person conversation (8–10 exchanges) where two people debate or discuss a scenario related to today's topic, using today's grammar and vocab; (c) 3 sentence-construction exercises (given keywords, write a complete sentence).`);
  } else if (m === "blandet") {
    L.push(`S1 (1h 15min): Learn today's vocab + grammar with MIXED exercises. Generate 8–10 drills: 4–5 written exercises (write sentences, fill blanks, short paragraphs) + 4–5 spoken exercises (say sentences aloud, describe scenarios verbally). Mark each drill with [SKRIV] or [SI HØYT].`);
    L.push(`S2 (1h 15min): MIXED PRACTICE — Generate: (a) one written exercise (write a 60–80 word paragraph using today's vocab), (b) one read-aloud exercise (read your paragraph aloud, then improvise a 1-minute spoken extension), (c) 3 simple spoken response questions (answer aloud in 30 seconds each).`);
  } else if (m === "muntlig_fokus") {
    L.push(`S1 (1h 15min): Learn today's vocab + grammar with SPEAKING-FOCUSED exercises. Generate 8–10 drills: 6–7 oral (say sentences aloud, describe scenarios, 2-minute mini-monologues) + 2–3 written support (write key phrases, sentence starters, or brief notes before speaking). Mark each with [SI HØYT] or [SKRIV FØRST, SÅ SI].`);
    L.push(`S2 (1h 15min): SPEAKING PRACTICE — Generate: (a) one realistic role-play scenario with both roles written out, (b) 3 opinion discussion questions for 2-min monologue practice, (c) one simulated paired discussion topic (exam-style). For each, the learner may write 3 bullet-point notes first, then must speak without reading.`);
  } else {
    L.push(`S1 (1h 15min): Learn today's vocab + grammar with SPEAKING-FIRST exercises. Generate 8–10 oral drills: say sentences aloud using new vocab, describe scenarios using new grammar, deliver 2-minute mini-monologues on prompted topics. Reference NTNU Learn Norwegian or NRK Norskkurs if relevant.`);
    L.push(`S2 (1h 15min): SPEAKING PRACTICE — Generate: (a) one realistic role-play scenario with both roles written out, (b) 3 opinion discussion questions for 2-min monologue practice, (c) one simulated paired discussion topic (exam-style, with suggested talking points for each side).`);
  }
}

function buildLightSessions(mode, L) {
  const m = mode.id;
  if (m === "skriftlig") {
    L.push(`S1 (35 min): READING + WRITTEN NOTES — Read a "Klar Tale" or NRK article. Write down 5 new words with their meaning. Write 3 sentences using those words.`);
    L.push(`S2 (35 min): QUICK OPINION WRITING — Pick 1 topic from today and write a short opinion (40–60 words): state your position, give 1 reason, and 1 counter-argument. Then write a mini 4-exchange dialogue between two people discussing the same topic.`);
  } else if (m === "blandet") {
    L.push(`S1 (35 min): READING + READ-ALOUD — Read a "Klar Tale" or NRK article. Write down 5 new words, then read the article aloud. Practice pronunciation of the new words.`);
    L.push(`S2 (35 min): MIXED RESPONSE — Answer 5 questions related to today's topic: write the first 3, speak the last 2 aloud (30–60 seconds each, no writing).`);
  } else if (m === "muntlig_fokus") {
    L.push(`S1 (35 min): LISTENING + SHADOWING — Listen to "Klar Tale" or "NRK Nyheter" segment. Shadow (repeat aloud) for at least 10 min. Write down 5 new words heard.`);
    L.push(`S2 (35 min): QUICK-FIRE SPEAKING — Respond aloud to 5 opinion questions related to today's topic. Aim for 30–60 seconds per answer. No writing — speak only.`);
  } else {
    L.push(`S1 (35 min): LISTENING + SHADOWING — Listen to "Klar Tale" or "NRK Nyheter" segment. Shadow (repeat aloud immediately after speaker) for at least 10 min. Note 5 new words heard.`);
    L.push(`S2 (35 min): QUICK-FIRE SPEAKING — Respond aloud to 5 opinion questions related to today's topic. Aim for 30–60 seconds per answer. No writing — speak only.`);
  }
}

function buildReviewSessions(mode, weekNum, L) {
  const m = mode.id;
  if (m === "skriftlig") {
    L.push(`S1 (1 hr): WRITTEN MOCK DISCUSSION — Simulate a muntlig exam on paper: (a) Write a 100–150 word self-introduction covering your background, interests, and goals. (b) Pick a discussion topic from this week — write your opinion (80–100 words) with at least 3 arguments using "for det første", "dessuten", "på den andre siden". (c) Write a full paired discussion (10–12 exchanges) between two people debating this week's theme — use this week's vocab and grammar throughout.`);
    L.push(`S2 (30 min): SELF-ASSESSMENT — Review your written work. Check: spelling, noun genders, verb conjugations, word order (V2 rule). Rate yourself 1–5 on: vocabulary range, grammatical accuracy, ability to build arguments, quality of written dialogues.`);
  } else if (m === "blandet") {
    L.push(`S1 (45 min): WRITTEN + SPOKEN REVIEW — Write a short paragraph (80–100 words) on one of this week's themes, then READ IT ALOUD. Next, answer 3 opinion questions ORALLY (60 seconds each, no notes).`);
    L.push(`S2 (30 min): SELF-ASSESSMENT — Rate yourself 1–5 on: written accuracy, spoken fluency, pronunciation, vocabulary range, ability to express opinions both in writing and speech. Note which mode (written vs spoken) felt easier.`);
  } else if (m === "muntlig_fokus") {
    L.push(`S1 (1 hr): MOCK MUNTLIG EXAM (with notes allowed) — Simulate the Norskprøven B1 muntlig format:`);
    L.push(`  Part A (3 min): Self-introduction monologue — you may prepare brief written bullet points first, then speak from them.`);
    L.push(`  Part B (5 min): Opinion question — pick a topic from this week. Write 3 key arguments, then argue the position ORALLY for 2 min, then counter-argue for 2 min.`);
    L.push(`  Part C (7 min): Paired discussion scenario — write out both roles (Candidate A and B) for an exam-style discussion based on this week's themes.`);
    L.push(`S2 (30 min): SELF-ASSESSMENT — Rate yourself 1–5 on: fluency, pronunciation, vocabulary range, grammatical accuracy, ability to express opinions. Note specific weak areas.`);
  } else {
    L.push(`S1 (1 hr): MOCK MUNTLIG EXAM — Simulate the Norskprøven B1 muntlig format:`);
    L.push(`  Part A (3 min): Self-introduction monologue — talk about yourself, your background, your interests.`);
    L.push(`  Part B (5 min): Opinion question — pick a topic from this week and argue a position for 2 min, then counter-argue for 2 min.`);
    L.push(`  Part C (7 min): Paired discussion scenario — write out both roles (Candidate A and B) for an exam-style discussion based on this week's themes.`);
    L.push(`S2 (30 min): SELF-ASSESSMENT — Rate yourself 1–5 on: fluency, pronunciation, vocabulary range, grammatical accuracy, ability to express opinions. Note specific weak areas.`);
  }
}

function buildRefresher(mode, done, L) {
  const m = mode.id;
  const label = S3_LABELS[m];

  L.push(`--- SESSION 3: ${label} (30 min) ---`);
  if (m === "skriftlig") {
    L.push(`Spaced repetition on ALL previously completed topics — ALL exercises done in WRITING. Do NOT repeat today's new topics here.`);
  } else if (m === "blandet") {
    L.push(`Spaced repetition on ALL previously completed topics — mix of WRITTEN and SPOKEN exercises. Do NOT repeat today's new topics here.`);
  } else {
    L.push(`Spaced repetition on ALL previously completed topics — ALL exercises done OUT LOUD. Do NOT repeat today's new topics here.`);
  }

  if (done.length === 0) {
    if (m === "skriftlig") {
      L.push(`(No previous topics yet — skip or use for free writing practice: write 5 sentences about yourself in Norwegian.)`);
    } else if (m === "blandet") {
      L.push(`(No previous topics yet — skip or use for free practice: write 3 sentences about yourself, then say 3 more sentences aloud.)`);
    } else {
      L.push(`(No previous topics yet — skip or use for free speaking practice: introduce yourself for 2 minutes.)`);
    }
  } else {
    L.push(`Previously completed topics (prioritise the OLDEST for spaced repetition):`);
    done.forEach((t, i) => L.push(`  ${i + 1}. ${t.t} — kw: ${t.kw.slice(0, 4).join(", ")}`));
    L.push(`\n${label} structure:`);

    if (m === "skriftlig") {
      L.push(`  • 5 vocab recall — [SKRIV] the Norwegian word, then write it in a complete sentence (from the oldest 3–4 topics above)`);
      L.push(`  • 3 grammar written drills — generate a prompt, answer must be a full written sentence using the target grammar (mix of grammar topics from above)`);
      L.push(`  • 1 short writing prompt (60–80 words) combining vocab from at least 2 different previous topics — give a topic and 3 guiding questions`);
    } else if (m === "blandet") {
      L.push(`  • 5 vocab recall — [SKRIV] write 3 in sentences, [SI HØYT] say 2 aloud in sentences (from the oldest 3–4 topics above)`);
      L.push(`  • 3 grammar drills — 1 written + 2 spoken — generate a prompt, answer must be a full sentence (mix of grammar topics from above)`);
      L.push(`  • 1 mixed prompt: write 3 bullet points on a topic combining 2 previous topics, then speak for 60 seconds using those notes`);
    } else {
      L.push(`  • 5 vocab recall — [SAY ALOUD] the Norwegian word, then use it in a complete spoken sentence (from the oldest 3–4 topics above)`);
      L.push(`  • 3 grammar spoken drills — generate a prompt, answer must be a full spoken sentence using the target grammar (mix of grammar topics from above)`);
      L.push(`  • 1 impromptu speaking prompt (60–90 seconds) combining vocab from at least 2 different previous topics — give a topic and 3 guiding questions to structure the response`);
    }
  }
}

function buildInstructions(mode, L) {
  const m = mode.id;
  L.push(`--- INSTRUCTIONS ---`);

  if (m === "skriftlig") {
    L.push(`Generate the full detailed plan. This is a SKRIFTLIG (writing) focused program. All exercises are written, but designed to build the THINKING PATTERNS needed for speaking later.`);
    L.push(`For vocab: Norwegian word + English meaning + example WRITTEN sentence + note on spelling/gender.`);
    L.push(`For grammar: brief rule explanation, then 5–8 WRITTEN sentence drills (the learner writes these — include the prompt and expected written answer).`);
    L.push(`For S2 written thinking practice: The goal is to train the learner to THINK in Norwegian. (a) For the written opinion piece: provide a clear discussion question, list 3–4 useful phrases/connectors to use, and show a model answer structure. (b) For the written paired discussion: set up a realistic scenario, provide both character descriptions, and give suggested talking points for each side — the learner writes both roles as a natural dialogue. (c) For sentence construction: provide keywords and expected output.`);
    L.push(`For the written refresher: actually write out the specific questions and prompts — don't describe them generically. Mark each one with [SKRIV].`);
    L.push(`Important: Frame all exercises as things to WRITE, but emphasise that writing opinions and dialogues is preparation for SPEAKING them later. Use prompts like "Skriv:", "Oversett:", "Skriv din mening:", "Skriv en samtale:", "Argumentér skriftlig:".`);
  } else if (m === "blandet") {
    L.push(`Generate the full detailed plan. This is a BLANDET (mixed writing + speaking) program. Exercises alternate between written and spoken.`);
    L.push(`For vocab: Norwegian word + English meaning + example sentence + pronunciation hint. Learner writes the word 3 times, then says it aloud in a sentence.`);
    L.push(`For grammar: brief rule explanation, then 5–8 drills — alternate between [SKRIV] written drills and [SI HØYT] spoken drills.`);
    L.push(`For S2 mixed practice: Generate a writing exercise followed by a read-aloud exercise, plus spoken response questions. Mark each clearly with [SKRIV] or [SI HØYT].`);
    L.push(`For the mixed refresher: actually write out the specific questions and prompts — don't describe them generically. Mark each with [SKRIV] or [SI HØYT].`);
    L.push(`Important: Clearly label each exercise as written or spoken. Use "Skriv:" for written and "Si høyt:" for spoken prompts.`);
  } else if (m === "muntlig_fokus") {
    L.push(`Generate the full detailed plan. This is a MUNTLIG-FOKUS (speaking-focused) program. Most exercises are oral, with some written preparation support.`);
    L.push(`For vocab: Norwegian word + English meaning + example SPOKEN sentence + pronunciation hint (stress pattern or tricky sounds).`);
    L.push(`For grammar: brief rule explanation, then 5–8 drills — mostly spoken [SI HØYT] with 1–2 written preparation notes [SKRIV FØRST, SÅ SI].`);
    L.push(`For S2 speaking practice: Generate realistic role-play scenarios. The learner may write 3 bullet-point notes first, then must speak without reading. Mark key exercises with [SI HØYT].`);
    L.push(`For the oral refresher: actually write out the specific questions and prompts — don't describe them generically. Mark each one with [SI HØYT].`);
    L.push(`Important: Frame most exercises as things to SAY, with occasional written notes as scaffolding. Use "Si høyt:", "Svar muntlig:", "Skriv stikkord, så forklar muntlig:".`);
  } else {
    L.push(`Generate the full detailed plan. This is a MUNTLIG (oral/speaking) focused program. All exercises should be designed to be spoken aloud, not written.`);
    L.push(`For vocab: Norwegian word + English meaning + example SPOKEN sentence + pronunciation hint (stress pattern or tricky sounds).`);
    L.push(`For grammar: brief rule explanation, then 5–8 SPOKEN sentence drills (the learner says these aloud — include the prompt and expected spoken answer).`);
    L.push(`For S2 speaking practice: Generate realistic, detailed role-play scenarios with both roles written out. For opinion questions, provide the question and 3–4 useful phrases/sentence starters. For discussion topics, give both sides with suggested arguments.`);
    L.push(`For the oral refresher: actually write out the specific questions and prompts — don't describe them generically. Mark each one with [SAY ALOUD].`);
    L.push(`Important: Frame all exercises as things to SAY, not WRITE. Use prompts like "Si høyt:", "Svar muntlig:", "Forklar muntlig:", "Beskriv med ord:".`);
  }
}

function buildPrompt(week, dayIdx, states) {
  const phase = phaseFor(week), wd = CUR[week], layout = DAY_LAYOUT[dayIdx];
  const dd = wd.days[dayIdx], isReview = dayIdx === 6, isLight = layout.type === "light";
  const mode = modeFor(week);
  const { done, skipped } = topicsBefore(week, dayIdx, states);
  const L = [];

  L.push(`=== NORWEGIAN B1 ${MODE_HEADERS[mode.id]} DAILY LESSON PLAN ===`);
  L.push(`Week ${week} · Day ${dayIdx + 1} (${layout.day}) · ${isLight ? "Light Day (mobile-friendly)" : isReview ? "Weekly Review" : "Full PC Day"}`);
  L.push(`Phase: ${phase.label} — ${phase.subtitle}`);
  L.push(`Learning Mode: ${mode.label} (${mode.en}) — ${mode.ratio}`);
  L.push(`Week Theme: ${wd.theme} — ${wd.focus}\n`);

  if (!isReview && dd) {
    L.push(`--- TODAY'S NEW TOPICS ---`);
    if (dd.v) { L.push(`[VOCAB] ${dd.v.t} (${dd.v.en}) — Status: ${states[dd.v.id] || "pending"}`); L.push(`  Keywords: ${dd.v.kw.join(", ")}`); }
    if (dd.g) { L.push(`[GRAMMAR] ${dd.g.t} (${dd.g.en}) — Status: ${states[dd.g.id] || "pending"}`); L.push(`  Focus: ${dd.g.kw.join(", ")}`); }
    L.push(``);
  }

  L.push(`--- SESSION STRUCTURE ---`);
  if (isReview) {
    buildReviewSessions(mode, week, L);
  } else if (isLight) {
    buildLightSessions(mode, L);
  } else {
    buildSessionStructure(mode, L);
  }
  L.push(`S3 (30 min): ${S3_LABELS[mode.id]} — see below.\n`);

  // ── Refresher ──
  buildRefresher(mode, done, L);
  L.push(``);

  if (skipped.length > 0) {
    L.push(`--- SKIPPED TOPICS (exclude from all exercises) ---`);
    skipped.forEach(t => L.push(`  • ${t.t} (${t.en})`));
    L.push(``);
  }

  buildInstructions(mode, L);
  return L.join("\n");
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const SK = "norwegian_b1_muntlig_v1";
function migrateStorage() { try { const old = localStorage.getItem("norwegian_b1_v1"); if (old && !localStorage.getItem(SK)) { localStorage.setItem(SK, old); } } catch {} }
function load() { migrateStorage(); try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : { ts: {}, dd: {} }; } catch { return { ts: {}, dd: {} }; } }
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

// ─── SESSION SUMMARY HELPER ──────────────────────────────────────────────────
function SessionSummary({ mode, isLight, isReview }) {
  const m = mode.id;
  if (isLight) {
    if (m === "skriftlig") return <>{`S1 (35 min) Reading + written notes`}<br />{`S2 (35 min) Quick opinion writing`}<br />{`S3 (30 min) Written Refresher ✍️`}</>;
    if (m === "blandet") return <>{`S1 (35 min) Reading + read-aloud`}<br />{`S2 (35 min) Mixed response (write + speak)`}<br />{`S3 (30 min) Mixed Refresher ✍️🗣️`}</>;
    if (m === "muntlig_fokus") return <>{`S1 (35 min) Listening + shadowing`}<br />{`S2 (35 min) Quick-fire speaking`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
    return <>{`S1 (35 min) Listening + shadowing`}<br />{`S2 (35 min) Quick-fire speaking`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
  }
  if (isReview) {
    if (m === "skriftlig") return <>{`S1 (1 hr)   Written mock discussion`}<br />{`S2 (30 min) Self-assessment (written)`}<br />{`S3 (30 min) Written Refresher ✍️`}</>;
    if (m === "blandet") return <>{`S1 (45 min) Written + spoken review`}<br />{`S2 (30 min) Self-assessment (mixed)`}<br />{`S3 (30 min) Mixed Refresher ✍️🗣️`}</>;
    if (m === "muntlig_fokus") return <>{`S1 (1 hr)   Mock muntlig (notes OK)`}<br />{`S2 (30 min) Fluency self-assessment`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
    return <>{`S1 (1 hr)   Mock muntlig exam`}<br />{`S2 (30 min) Fluency self-assessment`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
  }
  // heavy
  if (m === "skriftlig") return <>{`S1 (1h 15m) Vocab + grammar (written drills)`}<br />{`S2 (1h 15m) Opinion writing + paired discussion`}<br />{`S3 (30 min) Written Refresher ✍️`}</>;
  if (m === "blandet") return <>{`S1 (1h 15m) Vocab + grammar (write + speak)`}<br />{`S2 (1h 15m) Mixed practice (write then speak)`}<br />{`S3 (30 min) Mixed Refresher ✍️🗣️`}</>;
  if (m === "muntlig_fokus") return <>{`S1 (1h 15m) Vocab + grammar (speaking-focused)`}<br />{`S2 (1h 15m) Role-play + monologues`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
  return <>{`S1 (1h 15m) Vocab + grammar (oral drills)`}<br />{`S2 (1h 15m) Role-play + monologues`}<br />{`S3 (30 min) Oral Refresher 🗣️`}</>;
}

// ─── DAY CARD ────────────────────────────────────────────────────────────────
function DayCard({ weekNum, dayIdx, topicStates, daysDone, onDayToggle, onTopicToggle, C }) {
  const [open, setOpen] = useState(false);
  const [showP, setShowP] = useState(false);
  const [copied, setCopied] = useState(false);
  const layout = DAY_LAYOUT[dayIdx], phase = phaseFor(weekNum);
  const mode = modeFor(weekNum);
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
              <SessionSummary mode={mode} isLight={isLight} isReview={isReview} />
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
  const mode = modeFor(week);

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
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.text }}>🇳🇴 Norwegian B1 Tracker <span style={{ fontSize: 13, fontWeight: 500, color: C.textDim }}>v4.0</span></h1>
          <p style={{ margin: "3px 0 0", color: C.textDim, fontSize: 11 }}>Writing → Speaking progression · skriftlig → blandet → muntlig-fokus → muntlig · progress saved</p>
        </div>
        <button onClick={toggleDark} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 2, transition: "all 0.2s" }} title={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☀️" : "🌙"}</button>
      </div>

      {/* stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
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

      {/* mode progression indicator */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", marginBottom: 12 }}>
        <div style={{ color: C.textDim, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Learning Mode</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {PHASES.map(p => {
            const m = MODES[p.mode];
            const active = p.weeks.includes(week);
            return (
              <div key={p.id} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  background: active ? p.color.mid : C.surfaceHi,
                  color: active ? "#fff" : C.textDim,
                  borderRadius: 6, padding: "4px 6px", fontSize: 10, fontWeight: active ? 700 : 400,
                  transition: "all 0.2s",
                }}>
                  {m.icon} {m.label}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
          <span style={{ color: C.textDim, fontSize: 9 }}>✍️ Writing</span>
          <div style={{ flex: 1, height: 3, background: C.surfaceHi, borderRadius: 3, margin: "0 8px", position: "relative", overflow: "hidden" }}>
            <div style={{
              width: `${((week - 1) / 11) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${SHARED.green.mid}, ${SHARED.blue.mid}, ${SHARED.purple.mid}, ${SHARED.gold.mid})`,
              borderRadius: 3, transition: "width 0.4s",
            }} />
          </div>
          <span style={{ color: C.textDim, fontSize: 9 }}>🎤 Speaking</span>
        </div>
      </div>

      {/* phase nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {PHASES.map(p => {
          const active = p.weeks.includes(week);
          const m = MODES[p.mode];
          return <button key={p.id} onClick={() => setWeek(p.weeks[0])} style={{ flex: "1 1 110px", padding: "7px 9px", borderRadius: 8, border: active ? `2px solid ${p.color.mid}` : `1px solid ${C.border}`, background: active ? p.color.light + "18" : C.surface, color: active ? p.color.mid : C.textMute, fontFamily: "inherit", fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <div style={{ fontSize: 8, opacity: 0.55, textTransform: "uppercase", letterSpacing: 0.8 }}>Phase {p.id} · {m.icon}</div>
            <div style={{ fontWeight: 700 }}>{p.label}</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>{m.label}</div>
          </button>;
        })}
      </div>

      {/* week selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ color: phase.color.mid, fontSize: 19, fontWeight: 800 }}>Week {week}</span>
          <span style={{ color: C.textMute, fontSize: 13, fontWeight: 600 }}>— {CUR[week].theme}</span>
          <span style={{ color: C.textDim, fontSize: 10, background: C.surfaceHi, borderRadius: 4, padding: "2px 6px" }}>{mode.icon} {mode.label}</span>
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
          3. Tap <strong style={{ color: C.text }}>Generate & Copy</strong> — the prompt adapts to your current learning mode and carries your full topic history.<br />
          4. <strong style={{ color: C.text }}>Weeks 1–3 (Skriftlig)</strong>: All written — build vocab and grammar through writing.<br />
          5. <strong style={{ color: C.text }}>Weeks 4–6 (Blandet)</strong>: Write first, then speak — start thinking in Norwegian aloud.<br />
          6. <strong style={{ color: C.text }}>Weeks 7–9 (Muntlig-fokus)</strong>: Mostly oral, with brief written notes as support.<br />
          7. <strong style={{ color: C.text }}>Weeks 10–12 (Muntlig)</strong>: Full speaking — mock muntlig exams, interview prep, no writing crutch.<br />
          8. <strong style={{ color: C.text }}>Session 3 (Refresher)</strong> adapts: written → mixed → oral spaced repetition.<br />
          9. <strong style={{ color: C.text }}>Sundays</strong>: Review day — written review (early) → mock muntlig exam (later).<br />
          10. Tick the day ✓ when all 3 sessions are complete.
        </div>
      </div>
    </div>
    </div>
  );
}
