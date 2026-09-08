import type { LangPack, SearchIntent, SerpStyle } from "./types";

export function cap(s: string) {
  return s.replace(/(^|\s)\S/gu, (m) => m.toUpperCase());
}

export function core(kw: string) {
  return kw.replace(/^(best|top|the best|beste[rn]?|meilleur[es]?|mejor(?:es)?|miglior[ei]?|melhor(?:es)?)\s+/i, "");
}

type TitleFn = (kw: string, name: string) => string;
type SnipFn = (kw: string) => string;
type PaaFn = (kw: string) => string;

export type CopyPack = {
  titles: Record<SerpStyle, TitleFn[]>;
  snippets: Record<SerpStyle, SnipFn[]>;
  paa: Record<SearchIntent, PaaFn[]>;
  aiOverview: (kw: string) => string;
  featured: (kw: string) => string;
};

const EN: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: The Complete Guide (2026)`, (kw) => `What Is ${cap(kw)}? Definition, Examples & Tips`, (kw, n) => `${cap(kw)} Explained: How It Works | ${n}`],
    encyclopedia: [(kw) => `${cap(kw)} - Wikipedia`],
    review: [(kw) => `The 10 Best ${cap(core(kw))} of 2026 (Tested & Ranked)`, (kw, n) => `Best ${cap(core(kw))}: Top Picks Compared | ${n}`, (kw, n) => `${cap(kw)} Reviews 2026: Pros, Cons & Pricing - ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} - Compare Prices & Offers | ${n}`, (kw, n) => `Buy ${cap(kw)} Online - Best Prices | ${n}`, (kw, n) => `${cap(kw)}: ${n}`],
    brand: [(kw, n) => `${n} - ${cap(kw)}`, (kw, n) => `${cap(kw)} | ${n}`],
    forum: [(kw) => `What's the best ${core(kw)} right now? Honest answers`, (kw) => `${cap(kw)} - is it worth it? (2026 thread)`],
    news: [(kw, n) => `${cap(kw)} in 2026: What's Changing | ${n}`, (kw, n) => `${n}: Everything About ${cap(kw)}`],
    tool: [(kw, n) => `Free ${cap(kw)} Tool - ${n}`],
  },
  snippets: {
    guide: [
      (kw) => `Learn what ${kw} is, how it works and when to use it. We cover definitions, real examples, common mistakes and a step-by-step checklist you can apply today.`,
      (kw) => `A practical, plain-language guide to ${kw}. Updated for 2026 with new examples, benchmarks and answers to the questions people ask most.`,
    ],
    encyclopedia: [(kw) => `${cap(kw)} refers to … This article covers history, terminology, notable examples and related concepts, with citations.`],
    review: [
      (kw) => `We tested the leading ${kw} options on price, features and support. See our top picks, who each one is best for, and what to avoid.`,
      (kw) => `Compare the best ${kw} side by side: pricing, ratings, pros and cons from thousands of verified users.`,
    ],
    marketplace: [
      (kw) => `Browse ${kw} from top brands. Compare prices, read reviews and find the best offer with fast delivery and free returns.`,
      (kw) => `Thousands of ${kw} listings in stock. Filter by price, rating and brand. Secure checkout and price match.`,
    ],
    brand: [(kw) => `Discover ${kw} built for teams that move fast. Transparent pricing, world-class support and everything you need to get started.`],
    forum: [(kw) => `I've been looking into ${kw} for months. Here's what actually worked, what didn't, and what the community recommends …`],
    news: [(kw) => `New rules, new tools and shifting prices: our reporters break down what ${kw} looks like this year and what it means for you.`],
    tool: [(kw) => `Free ${kw} tool. No sign-up. Paste your data, get instant results and export in one click.`],
  },
  paa: {
    informational: [(kw) => `What is ${kw}?`, (kw) => `How does ${kw} work?`, (kw) => `What are examples of ${kw}?`, (kw) => `Is ${kw} worth it in 2026?`],
    commercial: [(kw) => `What is the best ${core(kw)}?`, (kw) => `How much does ${core(kw)} cost?`, (kw) => `Which ${core(kw)} is best for small business?`, (kw) => `What should I look for in ${core(kw)}?`],
    transactional: [(kw) => `Where can I buy ${core(kw)}?`, (kw) => `How much is ${core(kw)}?`, (kw) => `Is there a discount on ${core(kw)}?`, (kw) => `What is the cheapest ${core(kw)}?`],
    navigational: [(kw) => `Is ${kw} free?`, (kw) => `How do I log in to ${kw}?`, (kw) => `Who owns ${kw}?`, (kw) => `Is ${kw} safe to use?`],
  },
  aiOverview: (kw) => `${cap(kw)} is best understood as a set of practices and tools that solve a specific problem. Most sources agree on three things: start with the basics, measure results, and adjust based on what the data shows.`,
  featured: (kw) => `${cap(kw)} is the process of … In practice it involves three steps: defining the goal, choosing the right approach, and measuring the outcome against a baseline.`,
};

const DE: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: Der komplette Leitfaden (2026)`, (kw) => `Was ist ${cap(kw)}? Definition und Tipps`, (kw, n) => `${cap(kw)} erklärt | ${n}`],
    encyclopedia: [(kw) => `${cap(kw)} – Wikipedia`],
    review: [(kw) => `Die 10 besten ${cap(core(kw))} 2026 (getestet)`, (kw, n) => `Beste ${cap(core(kw))}: Vergleich | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} kaufen – Preise vergleichen | ${n}`, (kw, n) => `${cap(kw)}: ${n}`],
    brand: [(kw, n) => `${n} – ${cap(kw)}`, (kw, n) => `${cap(kw)} | ${n}`],
    forum: [(kw) => `Was ist der beste ${core(kw)}? Ehrliche Antworten`, (kw) => `${cap(kw)} – lohnt es sich?`],
    news: [(kw, n) => `${cap(kw)} 2026: Was sich ändert | ${n}`],
    tool: [(kw, n) => `Kostenloses ${cap(kw)}-Tool – ${n}`],
  },
  snippets: {
    guide: [(kw) => `Was ${kw} ist, wie es funktioniert und wann du es nutzt. Definitionen, Beispiele und eine Checkliste.`],
    encyclopedia: [(kw) => `${cap(kw)} bezeichnet … Geschichte, Begriffe und verwandte Konzepte.`],
    review: [(kw) => `Wir haben ${kw} nach Preis, Funktionen und Support getestet. Top-Auswahl und für wen es sich lohnt.`],
    marketplace: [(kw) => `${kw} von Top-Marken. Preise vergleichen, Bewertungen lesen, schnell liefern lassen.`],
    brand: [(kw) => `${kw} für Teams, die schnell liefern. Klare Preise und Support.`],
    forum: [(kw) => `Ich habe ${kw} monatelang getestet. Was wirklich hilft – und was nicht.`],
    news: [(kw) => `Neue Regeln und Preise: was ${kw} in diesem Jahr bedeutet.`],
    tool: [(kw) => `Kostenloses ${kw}-Tool. Keine Anmeldung. Daten einfügen, Ergebnis exportieren.`],
  },
  paa: {
    informational: [(kw) => `Was ist ${kw}?`, (kw) => `Wie funktioniert ${kw}?`, (kw) => `Beispiele für ${kw}?`, (kw) => `Lohnt sich ${kw} 2026?`],
    commercial: [(kw) => `Was ist der beste ${core(kw)}?`, (kw) => `Was kostet ${core(kw)}?`, (kw) => `Welcher ${core(kw)} für Selbstständige?`, (kw) => `Worauf achten bei ${core(kw)}?`],
    transactional: [(kw) => `Wo ${core(kw)} kaufen?`, (kw) => `Was kostet ${core(kw)}?`, (kw) => `Gibt es Rabatt auf ${core(kw)}?`, (kw) => `Günstigster ${core(kw)}?`],
    navigational: [(kw) => `Ist ${kw} kostenlos?`, (kw) => `Wie melde ich mich bei ${kw} an?`, (kw) => `Wem gehört ${kw}?`, (kw) => `Ist ${kw} sicher?`],
  },
  aiOverview: (kw) => `${cap(kw)} ist ein Bündel von Praktiken und Werkzeugen für ein konkretes Problem. Die Quellen sind sich einig: Grundlagen, messen, anpassen.`,
  featured: (kw) => `${cap(kw)} umfasst drei Schritte: Ziel definieren, Ansatz wählen, Ergebnis gegen eine Baseline messen.`,
};

const FR: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)} : le guide complet (2026)`, (kw) => `Qu'est-ce que ${cap(kw)} ? Définition et conseils`],
    encyclopedia: [(kw) => `${cap(kw)} — Wikipédia`],
    review: [(kw) => `Les 10 meilleurs ${cap(core(kw))} de 2026`, (kw, n) => `Meilleur ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — comparer les prix | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `Quel est le meilleur ${core(kw)} ? Avis honnêtes`],
    news: [(kw, n) => `${cap(kw)} en 2026 | ${n}`],
    tool: [(kw, n) => `Outil ${cap(kw)} gratuit — ${n}`],
  },
  snippets: {
    guide: [(kw) => `Ce qu'est ${kw}, comment ça marche et quand l'utiliser. Définitions, exemples, checklist.`],
    encyclopedia: [(kw) => `${cap(kw)} désigne … histoire, vocabulaire et notions liées.`],
    review: [(kw) => `Nous avons testé ${kw} sur le prix, les fonctions et le support.`],
    marketplace: [(kw) => `${kw} des grandes marques. Comparez, lisez les avis, livrez vite.`],
    brand: [(kw) => `${kw} pour les équipes rapides. Prix clairs, support.`],
    forum: [(kw) => `Des mois sur ${kw} : ce qui marche vraiment, selon la communauté.`],
    news: [(kw) => `Règles et prix : ce que ${kw} change cette année.`],
    tool: [(kw) => `Outil ${kw} gratuit, sans inscription.`],
  },
  paa: {
    informational: [(kw) => `Qu'est-ce que ${kw} ?`, (kw) => `Comment marche ${kw} ?`, (kw) => `Exemples de ${kw} ?`, (kw) => `${kw} en vaut-il la peine ?`],
    commercial: [(kw) => `Quel est le meilleur ${core(kw)} ?`, (kw) => `Combien coûte ${core(kw)} ?`, (kw) => `Quel ${core(kw)} pour une PME ?`, (kw) => `Que regarder chez ${core(kw)} ?`],
    transactional: [(kw) => `Où acheter ${core(kw)} ?`, (kw) => `Prix de ${core(kw)} ?`, (kw) => `Promo sur ${core(kw)} ?`, (kw) => `Le ${core(kw)} le moins cher ?`],
    navigational: [(kw) => `${kw} est-il gratuit ?`, (kw) => `Comment se connecter à ${kw} ?`, (kw) => `Qui possède ${kw} ?`, (kw) => `${kw} est-il sûr ?`],
  },
  aiOverview: (kw) => `${cap(kw)} désigne un ensemble de pratiques. Les sources s'accordent : bases, mesure, ajustement.`,
  featured: (kw) => `${cap(kw)} : définir l'objectif, choisir l'approche, mesurer le résultat.`,
};

const ES: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: guía completa (2026)`, (kw) => `¿Qué es ${cap(kw)}? Definición y consejos`],
    encyclopedia: [(kw) => `${cap(kw)} - Wikipedia`],
    review: [(kw) => `Los 10 mejores ${cap(core(kw))} de 2026`, (kw, n) => `Mejor ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — compara precios | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `¿Cuál es el mejor ${core(kw)}? Opiniones reales`],
    news: [(kw, n) => `${cap(kw)} en 2026 | ${n}`],
    tool: [(kw, n) => `Herramienta gratis de ${cap(kw)} — ${n}`],
  },
  snippets: {
    guide: [(kw) => `Qué es ${kw}, cómo funciona y cuándo usarlo. Definiciones, ejemplos y una lista.`],
    encyclopedia: [(kw) => `${cap(kw)} se refiere a … historia, términos y conceptos relacionados.`],
    review: [(kw) => `Probamos ${kw} por precio, funciones y soporte. Nuestra selección.`],
    marketplace: [(kw) => `${kw} de marcas top. Compara precios, lee reseñas, entrega rápida.`],
    brand: [(kw) => `${kw} para equipos rápidos. Precios claros y soporte.`],
    forum: [(kw) => `Llevo meses con ${kw}. Lo que funciona, según la comunidad.`],
    news: [(kw) => `Nuevas reglas y precios: qué implica ${kw} este año.`],
    tool: [(kw) => `Herramienta de ${kw} gratis, sin registro.`],
  },
  paa: {
    informational: [(kw) => `¿Qué es ${kw}?`, (kw) => `¿Cómo funciona ${kw}?`, (kw) => `¿Ejemplos de ${kw}?`, (kw) => `¿Vale la pena ${kw}?`],
    commercial: [(kw) => `¿Cuál es el mejor ${core(kw)}?`, (kw) => `¿Cuánto cuesta ${core(kw)}?`, (kw) => `¿Qué ${core(kw)} para pymes?`, (kw) => `¿Qué mirar en ${core(kw)}?`],
    transactional: [(kw) => `¿Dónde comprar ${core(kw)}?`, (kw) => `¿Precio de ${core(kw)}?`, (kw) => `¿Hay descuento en ${core(kw)}?`, (kw) => `¿El ${core(kw)} más barato?`],
    navigational: [(kw) => `¿${kw} es gratis?`, (kw) => `¿Cómo entrar a ${kw}?`, (kw) => `¿Quién es dueño de ${kw}?`, (kw) => `¿Es seguro ${kw}?`],
  },
  aiOverview: (kw) => `${cap(kw)} es un conjunto de prácticas. Las fuentes coinciden: bases, medir, ajustar.`,
  featured: (kw) => `${cap(kw)}: define el objetivo, elige el enfoque y mide el resultado.`,
};

const IT: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: guida completa (2026)`, (kw) => `Cos'è ${cap(kw)}? Definizione e consigli`],
    encyclopedia: [(kw) => `${cap(kw)} - Wikipedia`],
    review: [(kw) => `I 10 migliori ${cap(core(kw))} del 2026`, (kw, n) => `Miglior ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — confronta i prezzi | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `Qual è il miglior ${core(kw)}? Pareri onesti`],
    news: [(kw, n) => `${cap(kw)} nel 2026 | ${n}`],
    tool: [(kw, n) => `Tool ${cap(kw)} gratis — ${n}`],
  },
  snippets: {
    guide: [(kw) => `Cos'è ${kw}, come funziona e quando usarlo. Definizioni, esempi, checklist.`],
    encyclopedia: [(kw) => `${cap(kw)} indica … storia, termini e concetti collegati.`],
    review: [(kw) => `Abbiamo testato ${kw} su prezzo, funzioni e supporto.`],
    marketplace: [(kw) => `${kw} dei grandi brand. Confronta, leggi le recensioni, consegna rapida.`],
    brand: [(kw) => `${kw} per team veloci. Prezzi chiari e supporto.`],
    forum: [(kw) => `Mesi su ${kw}: cosa funziona davvero, secondo la community.`],
    news: [(kw) => `Regole e prezzi: cosa cambia ${kw} quest'anno.`],
    tool: [(kw) => `Tool ${kw} gratis, senza registrazione.`],
  },
  paa: {
    informational: [(kw) => `Cos'è ${kw}?`, (kw) => `Come funziona ${kw}?`, (kw) => `Esempi di ${kw}?`, (kw) => `${kw} ne vale la pena?`],
    commercial: [(kw) => `Qual è il miglior ${core(kw)}?`, (kw) => `Quanto costa ${core(kw)}?`, (kw) => `Quale ${core(kw)} per le PMI?`, (kw) => `Cosa valutare in ${core(kw)}?`],
    transactional: [(kw) => `Dove comprare ${core(kw)}?`, (kw) => `Prezzo di ${core(kw)}?`, (kw) => `Sconto su ${core(kw)}?`, (kw) => `${core(kw)} più economico?`],
    navigational: [(kw) => `${kw} è gratis?`, (kw) => `Come accedo a ${kw}?`, (kw) => `Chi possiede ${kw}?`, (kw) => `${kw} è sicuro?`],
  },
  aiOverview: (kw) => `${cap(kw)} è un insieme di pratiche. Le fonti concordano: basi, misura, aggiusta.`,
  featured: (kw) => `${cap(kw)}: definisci l'obiettivo, scegli l'approccio, misura il risultato.`,
};

const NL: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: de complete gids (2026)`, (kw) => `Wat is ${cap(kw)}? Definitie en tips`],
    encyclopedia: [(kw) => `${cap(kw)} - Wikipedia`],
    review: [(kw) => `De 10 beste ${cap(core(kw))} van 2026`, (kw, n) => `Beste ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — vergelijk prijzen | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `Wat is de beste ${core(kw)}? Eerlijke meningen`],
    news: [(kw, n) => `${cap(kw)} in 2026 | ${n}`],
    tool: [(kw, n) => `Gratis ${cap(kw)}-tool — ${n}`],
  },
  snippets: {
    guide: [(kw) => `Wat ${kw} is, hoe het werkt en wanneer je het gebruikt. Definities, voorbeelden, checklist.`],
    encyclopedia: [(kw) => `${cap(kw)} verwijst naar … geschiedenis, termen en verwante begrippen.`],
    review: [(kw) => `We testten ${kw} op prijs, functies en support.`],
    marketplace: [(kw) => `${kw} van topmerken. Vergelijk prijzen, lees reviews, snelle levering.`],
    brand: [(kw) => `${kw} voor snelle teams. Transparante prijzen en support.`],
    forum: [(kw) => `Maanden ${kw} getest: wat echt werkt, volgens de community.`],
    news: [(kw) => `Nieuwe regels en prijzen: wat ${kw} dit jaar betekent.`],
    tool: [(kw) => `Gratis ${kw}-tool, geen account nodig.`],
  },
  paa: {
    informational: [(kw) => `Wat is ${kw}?`, (kw) => `Hoe werkt ${kw}?`, (kw) => `Voorbeelden van ${kw}?`, (kw) => `Is ${kw} het waard?`],
    commercial: [(kw) => `Wat is de beste ${core(kw)}?`, (kw) => `Wat kost ${core(kw)}?`, (kw) => `Welke ${core(kw)} voor zzp?`, (kw) => `Waarop letten bij ${core(kw)}?`],
    transactional: [(kw) => `Waar ${core(kw)} kopen?`, (kw) => `Prijs van ${core(kw)}?`, (kw) => `Korting op ${core(kw)}?`, (kw) => `Goedkoopste ${core(kw)}?`],
    navigational: [(kw) => `Is ${kw} gratis?`, (kw) => `Hoe log ik in bij ${kw}?`, (kw) => `Wie is eigenaar van ${kw}?`, (kw) => `Is ${kw} veilig?`],
  },
  aiOverview: (kw) => `${cap(kw)} is een set praktijken. Bronnen zijn het eens: basis, meten, bijsturen.`,
  featured: (kw) => `${cap(kw)}: doel bepalen, aanpak kiezen, resultaat meten.`,
};

const EL: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: πλήρης οδηγός (2026)`, (kw) => `Τι είναι το ${cap(kw)}; Ορισμός και συμβουλές`],
    encyclopedia: [(kw) => `${cap(kw)} - Βικιπαίδεια`],
    review: [(kw) => `Τα 10 καλύτερα ${cap(core(kw))} του 2026`, (kw, n) => `Καλύτερο ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — σύγκριση τιμών | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `Ποιο είναι το καλύτερο ${core(kw)}; Ειλικρινείς γνώμες`],
    news: [(kw, n) => `${cap(kw)} το 2026 | ${n}`],
    tool: [(kw, n) => `Δωρεάν εργαλείο ${cap(kw)} — ${n}`],
  },
  snippets: {
    guide: [(kw) => `Τι είναι το ${kw}, πώς δουλεύει και πότε το χρησιμοποιείς. Ορισμοί, παραδείγματα, λίστα ελέγχου.`],
    encyclopedia: [(kw) => `Το ${cap(kw)} αναφέρεται σε … ιστορία, όρους και συναφείς έννοιες.`],
    review: [(kw) => `Δοκιμάσαμε ${kw} σε τιμή, δυνατότητες και υποστήριξη.`],
    marketplace: [(kw) => `${kw} από γνωστές μάρκες. Σύγκρινε τιμές, διάβασε αξιολογήσεις, γρήγορη παράδοση.`],
    brand: [(kw) => `${kw} για ομάδες που κινούνται γρήγορα. Καθαρές τιμές και υποστήριξη.`],
    forum: [(kw) => `Μήνες με ${kw}: τι δουλεύει πραγματικά, σύμφωνα με την κοινότητα.`],
    news: [(kw) => `Νέοι κανόνες και τιμές: τι σημαίνει το ${kw} φέτος.`],
    tool: [(kw) => `Δωρεάν εργαλείο ${kw}, χωρίς εγγραφή.`],
  },
  paa: {
    informational: [(kw) => `Τι είναι το ${kw};`, (kw) => `Πώς λειτουργεί το ${kw};`, (kw) => `Παραδείγματα του ${kw};`, (kw) => `Αξίζει το ${kw};`],
    commercial: [(kw) => `Ποιο είναι το καλύτερο ${core(kw)};`, (kw) => `Πόσο κοστίζει το ${core(kw)};`, (kw) => `Ποιο ${core(kw)} για μικρή επιχείρηση;`, (kw) => `Τι να κοιτάξω στο ${core(kw)};`],
    transactional: [(kw) => `Πού να αγοράσω ${core(kw)};`, (kw) => `Πόσο κάνει το ${core(kw)};`, (kw) => `Υπάρχει έκπτωση στο ${core(kw)};`, (kw) => `Το φθηνότερο ${core(kw)};`],
    navigational: [(kw) => `Είναι δωρεάν το ${kw};`, (kw) => `Πώς συνδέομαι στο ${kw};`, (kw) => `Ποιος έχει το ${kw};`, (kw) => `Είναι ασφαλές το ${kw};`],
  },
  aiOverview: (kw) => `Το ${cap(kw)} είναι ένα σύνολο πρακτικών. Οι πηγές συμφωνούν: βάσεις, μέτρηση, προσαρμογή.`,
  featured: (kw) => `Το ${cap(kw)}: όρισε τον στόχο, διάλεξε προσέγγιση, μέτρησε το αποτέλεσμα.`,
};

const PT: CopyPack = {
  titles: {
    guide: [(kw) => `${cap(kw)}: guia completo (2026)`, (kw) => `O que é ${cap(kw)}? Definição e dicas`],
    encyclopedia: [(kw) => `${cap(kw)} - Wikipédia`],
    review: [(kw) => `Os 10 melhores ${cap(core(kw))} de 2026`, (kw, n) => `Melhor ${cap(core(kw))} | ${n}`],
    marketplace: [(kw, n) => `${cap(kw)} — compare preços | ${n}`],
    brand: [(kw, n) => `${n} — ${cap(kw)}`],
    forum: [(kw) => `Qual o melhor ${core(kw)}? Opiniões honestas`],
    news: [(kw, n) => `${cap(kw)} em 2026 | ${n}`],
    tool: [(kw, n) => `Ferramenta grátis de ${cap(kw)} — ${n}`],
  },
  snippets: {
    guide: [(kw) => `O que é ${kw}, como funciona e quando usar. Definições, exemplos e checklist.`],
    encyclopedia: [(kw) => `${cap(kw)} refere-se a … história, termos e conceitos relacionados.`],
    review: [(kw) => `Testamos ${kw} em preço, recursos e suporte.`],
    marketplace: [(kw) => `${kw} das grandes marcas. Compare preços, leia avaliações, entrega rápida.`],
    brand: [(kw) => `${kw} para times rápidos. Preços claros e suporte.`],
    forum: [(kw) => `Meses com ${kw}: o que realmente funciona, segundo a comunidade.`],
    news: [(kw) => `Regras e preços: o que ${kw} muda este ano.`],
    tool: [(kw) => `Ferramenta de ${kw} grátis, sem cadastro.`],
  },
  paa: {
    informational: [(kw) => `O que é ${kw}?`, (kw) => `Como funciona ${kw}?`, (kw) => `Exemplos de ${kw}?`, (kw) => `${kw} vale a pena?`],
    commercial: [(kw) => `Qual o melhor ${core(kw)}?`, (kw) => `Quanto custa ${core(kw)}?`, (kw) => `Qual ${core(kw)} para PME?`, (kw) => `O que olhar em ${core(kw)}?`],
    transactional: [(kw) => `Onde comprar ${core(kw)}?`, (kw) => `Preço de ${core(kw)}?`, (kw) => `Tem desconto em ${core(kw)}?`, (kw) => `${core(kw)} mais barato?`],
    navigational: [(kw) => `${kw} é grátis?`, (kw) => `Como entrar no ${kw}?`, (kw) => `Quem é dono do ${kw}?`, (kw) => `${kw} é seguro?`],
  },
  aiOverview: (kw) => `${cap(kw)} é um conjunto de práticas. As fontes concordam: bases, medir, ajustar.`,
  featured: (kw) => `${cap(kw)}: defina o objetivo, escolha a abordagem, meça o resultado.`,
};

export const COPY: Record<LangPack, CopyPack> = {
  en: EN,
  de: DE,
  fr: FR,
  es: ES,
  it: IT,
  nl: NL,
  el: EL,
  pt: PT,
};

export function getCopy(pack: LangPack): CopyPack {
  return COPY[pack] ?? EN;
}
