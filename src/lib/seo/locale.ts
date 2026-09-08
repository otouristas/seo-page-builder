import type { LangPack, Market, SearchIntent } from "./types";
import { languageOf } from "./markets";

const EN_STOP =
  "a an and are as at be by for from has have how in is it its of on or that the this to was we what which who will with you your our their new best free online get more all can do does about into over under top vs via per also just than then them they there here when where why yes no not only own same so some such too very s t";
const DE_STOP = "der die das den dem des ein eine einer einem einen und oder aber mit von zu im in auf für als ist sind war wie was wer wo nicht nur auch noch nach bei aus über vor nach dem";
const FR_STOP = "le la les un une des du de d et ou mais avec pour dans sur par est sont était que qui quoi dont où ne pas plus aussi comme";
const ES_STOP = "el la los las un una unos unas y o pero con de del en por para es son era que quien cual donde no más también como";
const IT_STOP = "il lo la i gli le un uno una e o ma con di del della dei delle in per è sono era che chi quale dove non più anche come";
const NL_STOP = "de het een en of maar met van voor in op aan is zijn was die dat wat wie waar niet ook nog naar bij uit over";
const EL_STOP = "και το η ο οι τα των με για από στο στη στην στον σε που ως να είναι μια ένα δεν θα θας πως πώς τι";
const PT_STOP = "o a os as um uma uns umas e ou mas com de do da dos das em no na nos nas por para é são era que quem qual onde não mais também como";

export const STOPWORDS: Record<LangPack, Set<string>> = {
  en: new Set(EN_STOP.split(/\s+/)),
  de: new Set(DE_STOP.split(/\s+/)),
  fr: new Set(FR_STOP.split(/\s+/)),
  es: new Set(ES_STOP.split(/\s+/)),
  it: new Set(IT_STOP.split(/\s+/)),
  nl: new Set(NL_STOP.split(/\s+/)),
  el: new Set(EL_STOP.split(/\s+/)),
  pt: new Set(PT_STOP.split(/\s+/)),
};

export const ALL_STOPWORDS = new Set(Object.values(STOPWORDS).flatMap((s) => [...s]));

type IntentRx = { informational: RegExp; commercial: RegExp; transactional: RegExp };

export const INTENT_RX: Record<LangPack, IntentRx> = {
  en: {
    informational: /\b(what|how|why|guide|tutorial|meaning|definition|examples?|learn|explained|tips|ideas|history|vs)\b/i,
    commercial: /\b(best|top|review|reviews|compare|comparison|alternatives?|tools?|software|platform|services?|agency|solutions?|providers?|companies|rated|ranking)\b/i,
    transactional: /\b(buy|price|prices|pricing|cost|cheap|deal|deals|discount|order|book|booking|shop|store|sale|subscribe|download|sign ?up|checkout|coupon|offers?)\b/i,
  },
  de: {
    informational: /\b(was|wie|warum|leitfaden|anleitung|bedeutung|definition|beispiele?|lernen|tipps|geschichte)\b/i,
    commercial: /\b(beste[rn]?|top|test|vergleich|alternative[n]?|software|plattform|anbieter|bewertet)\b/i,
    transactional: /\b(kaufen|preis|preise|kosten|günstig|angebot|bestellen|buchen|shop|rabatt|sale)\b/i,
  },
  fr: {
    informational: /\b(quoi|comment|pourquoi|guide|tutoriel|définition|exemples?|apprendre|conseils|histoire)\b/i,
    commercial: /\b(meilleur[es]?|top|avis|comparatif|alternatives?|logiciel|plateforme|agence)\b/i,
    transactional: /\b(acheter|prix|tarif|pas cher|offre|commander|réserver|boutique|promo|soldes?)\b/i,
  },
  es: {
    informational: /\b(qué|como|cómo|por qué|guía|tutorial|definición|ejemplos?|aprender|consejos|historia)\b/i,
    commercial: /\b(mejor(?:es)?|top|reseña|opiniones|comparativa|alternativas?|software|plataforma)\b/i,
    transactional: /\b(comprar|precio|precios|barato|oferta|pedir|reservar|tienda|descuento)\b/i,
  },
  it: {
    informational: /\b(cosa|come|perché|guida|tutorial|definizione|esempi|imparare|consigli|storia)\b/i,
    commercial: /\b(miglior[ei]?|top|recensioni|confronto|alternative|software|piattaforma)\b/i,
    transactional: /\b(comprare|prezzo|prezzi|economico|offerta|ordinare|prenotare|negozio|sconto)\b/i,
  },
  nl: {
    informational: /\b(wat|hoe|waarom|gids|handleiding|definitie|voorbeelden|leren|tips|geschiedenis)\b/i,
    commercial: /\b(beste|top|review|vergelijk|alternatieven|software|platform|bureau)\b/i,
    transactional: /\b(kopen|prijs|prijzen|goedkoop|aanbieding|bestellen|boeken|winkel|korting)\b/i,
  },
  el: {
    informational: /\b(τι είναι|πώς|πως|γιατί|οδηγός|οδηγος|επεξήγηση|παραδείγματα|μάθετε)\b/i,
    commercial: /\b(καλύτερ\w*|κριτική|κριτικη|σύγκριση|συγκριση|εναλλακτικ\w*)\b/i,
    transactional: /\b(τιμή|τιμη|αγορά|αγορα|φθην\w*|έκπτωση|εκπτωση|κράτηση|παραγγελ\w*)\b/i,
  },
  pt: {
    informational: /\b(o que|como|por que|guia|tutorial|definição|exemplos?|aprender|dicas|história)\b/i,
    commercial: /\b(melhor(?:es)?|top|avaliação|comparativo|alternativas?|software|plataforma)\b/i,
    transactional: /\b(comprar|preço|preços|barato|oferta|pedir|reservar|loja|desconto)\b/i,
  },
};

/** Distinctive markers used to guess the language of a query or coach question. Transliteration is out of scope. */
const MARKERS: Record<Exclude<LangPack, "en">, RegExp> = {
  de: /[äöüß]|beste[rn]?|kaufen|preis|vergleich|leitfaden|günstig/i,
  fr: /[àâçêëîïôùûœ]|meilleur|acheter|prix|comparatif|guide/i,
  es: /[ñ¿¡]|mejor|comprar|precio|guía|comparativa/i,
  it: /\b(miglior|comprare|prezzo|guida|recensioni|come)\b|[àèéìòù]/i,
  nl: /\b(beste|kopen|prijs|vergelijk|gids|goedkoop|waarom)\b/i,
  el: /[\u0370-\u03FF\u1F00-\u1FFF]/,
  pt: /[ãõ]|melhor|comprar|preço|guia|comparativo/i,
};

export function detectLang(text: string): LangPack | null {
  const t = text.trim();
  if (!t) return null;
  if (MARKERS.el.test(t)) return "el";
  const hits: [Exclude<LangPack, "en">, boolean][] = [
    ["de", MARKERS.de.test(t)],
    ["fr", MARKERS.fr.test(t)],
    ["pt", MARKERS.pt.test(t)],
    ["es", MARKERS.es.test(t)],
    ["it", MARKERS.it.test(t)],
    ["nl", MARKERS.nl.test(t)],
  ];
  const found = hits.find(([, hit]) => hit);
  return found ? found[0] : null;
}

/** SERP copy language: keyword script/markers win; Latin with no signal stays English. */
export function copyLangFor(keyword: string, _market: Market): LangPack {
  return detectLang(keyword) ?? "en";
}

export function coachLangFor(question: string, market: Market): LangPack {
  return detectLang(question) ?? languageOf(market);
}

export function classifyIntentFor(keyword: string, pack: LangPack): SearchIntent | null {
  const rx = INTENT_RX[pack];
  if (rx.transactional.test(keyword)) return "transactional";
  if (rx.commercial.test(keyword)) return "commercial";
  if (rx.informational.test(keyword)) return "informational";
  return null;
}

export function anyIntent(keyword: string): SearchIntent | null {
  for (const pack of Object.keys(INTENT_RX) as LangPack[]) {
    const hit = classifyIntentFor(keyword, pack);
    if (hit) return hit;
  }
  return null;
}

export function tokensOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((t) => t.length > 1);
}

/** Token overlap 0–1, ignoring stopwords. Unicode-aware. */
export function tokenCoverage(needle: string, haystack: string): number {
  const need = tokensOf(needle).filter((t) => !ALL_STOPWORDS.has(t));
  if (!need.length) return haystack.toLowerCase().includes(needle.toLowerCase()) ? 1 : 0;
  const hay = new Set(tokensOf(haystack));
  const hit = need.filter((t) => hay.has(t) || [...hay].some((h) => h.includes(t) || t.includes(h))).length;
  return hit / need.length;
}
