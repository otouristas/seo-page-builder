import type { LangPack, Market, SearchIntent, SeoSnapshot, SerpResult, SerpStyle } from "./types";
import { hostOf, seeded } from "../utils";
import { copyLangFor } from "./locale";
import { cap, getCopy } from "./locale-copy";
import { languageOf } from "./markets";

type Style = SerpStyle;

type Competitor = { domain: string; name: string; authority: number; style: Style; hint: string };

type IntentPools = Record<Exclude<SearchIntent, "navigational">, Competitor[]>;

const EN: IntentPools = {
  informational: [
    { domain: "en.wikipedia.org", name: "Wikipedia", authority: 98, style: "encyclopedia", hint: "Entity coverage and thousands of referring domains." },
    { domain: "hubspot.com", name: "HubSpot", authority: 93, style: "guide", hint: "Long-form guides with strong internal linking." },
    { domain: "investopedia.com", name: "Investopedia", authority: 92, style: "guide", hint: "Definition-first structure that wins featured snippets." },
    { domain: "forbes.com", name: "Forbes", authority: 95, style: "news", hint: "Publisher authority and fresh dates." },
    { domain: "moz.com", name: "Moz", authority: 91, style: "guide", hint: "Topical authority in its niche, deep FAQ sections." },
    { domain: "medium.com", name: "Medium", authority: 94, style: "forum", hint: "Domain strength carries thin posts." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video intent blended into the SERP." },
    { domain: "semrush.com", name: "Semrush", authority: 92, style: "guide", hint: "Data-backed examples and original charts." },
    { domain: "quora.com", name: "Quora", authority: 93, style: "forum", hint: "UGC answers matching question phrasing." },
  ],
  commercial: [
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Thousands of verified reviews per category." },
    { domain: "capterra.com", name: "Capterra", authority: 89, style: "review", hint: "Comparison tables and filters for every tool." },
    { domain: "techradar.com", name: "TechRadar", authority: 92, style: "review", hint: "Tested roundups refreshed monthly." },
    { domain: "pcmag.com", name: "PCMag", authority: 91, style: "review", hint: "Lab-tested verdicts and rating badges." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Threads ranking for 'best' queries via UGC." },
    { domain: "forbes.com", name: "Forbes Advisor", authority: 95, style: "review", hint: "Publisher authority plus affiliate depth." },
    { domain: "zapier.com", name: "Zapier", authority: 92, style: "guide", hint: "Hands-on comparisons with screenshots." },
    { domain: "shopify.com", name: "Shopify", authority: 96, style: "guide", hint: "Brand authority extended to educational posts." },
    { domain: "nerdwallet.com", name: "NerdWallet", authority: 90, style: "review", hint: "Structured pros/cons that match intent." },
  ],
  transactional: [
    { domain: "amazon.com", name: "Amazon", authority: 99, style: "marketplace", hint: "Product schema, reviews and price signals." },
    { domain: "shopify.com", name: "Shopify", authority: 96, style: "brand", hint: "Brand landing pages with clear offers." },
    { domain: "bestbuy.com", name: "Best Buy", authority: 92, style: "marketplace", hint: "Availability and local pickup markup." },
    { domain: "walmart.com", name: "Walmart", authority: 94, style: "marketplace", hint: "Price competitiveness and stock data." },
    { domain: "etsy.com", name: "Etsy", authority: 93, style: "marketplace", hint: "Long-tail product titles at scale." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Aggregated inventory with rich results." },
    { domain: "ebay.com", name: "eBay", authority: 96, style: "marketplace", hint: "Massive listing depth for every variant." },
    { domain: "target.com", name: "Target", authority: 91, style: "marketplace", hint: "Offer schema plus store availability." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Brand demand and clean product pages." },
  ],
};

const DE: IntentPools = {
  informational: [
    { domain: "de.wikipedia.org", name: "Wikipedia", authority: 97, style: "encyclopedia", hint: "German-language entity coverage." },
    { domain: "spiegel.de", name: "Spiegel", authority: 88, style: "news", hint: "Publisher authority and freshness." },
    { domain: "chip.de", name: "CHIP", authority: 80, style: "guide", hint: "Explainers and tests for German searchers." },
    { domain: "t3n.de", name: "t3n", authority: 72, style: "guide", hint: "Digital-business guides." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video intent on the SERP." },
    { domain: "focus.de", name: "FOCUS", authority: 84, style: "news", hint: "News domain with deep archives." },
    { domain: "computerbild.de", name: "Computer Bild", authority: 78, style: "guide", hint: "Practical how-tos." },
    { domain: "heise.de", name: "heise", authority: 86, style: "guide", hint: "Technical depth and original reporting." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC still ranks in DE." },
  ],
  commercial: [
    { domain: "idealo.de", name: "Idealo", authority: 84, style: "marketplace", hint: "Price comparison native to google.de." },
    { domain: "chip.de", name: "CHIP", authority: 80, style: "review", hint: "Tested roundups for German buyers." },
    { domain: "computerbild.de", name: "Computer Bild", authority: 78, style: "review", hint: "Lab-style verdicts." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Global review authority." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "'Beste' threads via UGC." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Review volume." },
    { domain: "otto.de", name: "Otto", authority: 82, style: "marketplace", hint: "Retail brand with category pages." },
    { domain: "mediamarkt.de", name: "MediaMarkt", authority: 80, style: "marketplace", hint: "Electronics category depth." },
    { domain: "stiftung-warentest.de", name: "Stiftung Warentest", authority: 85, style: "review", hint: "Trusted independent tests." },
  ],
  transactional: [
    { domain: "amazon.de", name: "Amazon.de", authority: 98, style: "marketplace", hint: "Offer schema and reviews." },
    { domain: "otto.de", name: "Otto", authority: 82, style: "marketplace", hint: "Retail inventory." },
    { domain: "zalando.de", name: "Zalando", authority: 86, style: "marketplace", hint: "Brand + category pages." },
    { domain: "idealo.de", name: "Idealo", authority: 84, style: "marketplace", hint: "Aggregated offers." },
    { domain: "mediamarkt.de", name: "MediaMarkt", authority: 80, style: "marketplace", hint: "Store availability." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventory with rich results." },
    { domain: "ebay.de", name: "eBay", authority: 94, style: "marketplace", hint: "Listing depth." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Brand demand." },
    { domain: "lidl.de", name: "Lidl", authority: 76, style: "marketplace", hint: "Retail brand demand." },
  ],
};

const FR: IntentPools = {
  informational: [
    { domain: "fr.wikipedia.org", name: "Wikipédia", authority: 97, style: "encyclopedia", hint: "Couverture encyclopédique." },
    { domain: "lemonde.fr", name: "Le Monde", authority: 90, style: "news", hint: "Autorité éditoriale." },
    { domain: "commentcamarche.net", name: "CommentÇaMarche", authority: 74, style: "guide", hint: "Guides pratiques." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Intent vidéo." },
    { domain: "linternaute.com", name: "L'Internaute", authority: 76, style: "guide", hint: "Définitions et tutos." },
    { domain: "lefigaro.fr", name: "Le Figaro", authority: 88, style: "news", hint: "Archives et fraîcheur." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC." },
    { domain: "futura-sciences.com", name: "Futura", authority: 72, style: "guide", hint: "Vulgarisation." },
    { domain: "cnrs.fr", name: "CNRS", authority: 80, style: "encyclopedia", hint: "Sources institutionnelles." },
  ],
  commercial: [
    { domain: "quechoisir.org", name: "UFC-Que Choisir", authority: 78, style: "review", hint: "Tests indépendants." },
    { domain: "lesnumeriques.com", name: "Les Numériques", authority: 80, style: "review", hint: "Comparatifs testés." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Avis logiciels." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Fils 'meilleur'." },
    { domain: "fnac.com", name: "Fnac", authority: 84, style: "marketplace", hint: "Fiches catégorie." },
    { domain: "darty.com", name: "Darty", authority: 78, style: "marketplace", hint: "Retail + avis." },
    { domain: "cdiscount.com", name: "Cdiscount", authority: 80, style: "marketplace", hint: "Catalogue profond." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Volume d'avis." },
    { domain: "01net.com", name: "01net", authority: 74, style: "review", hint: "Tests high-tech." },
  ],
  transactional: [
    { domain: "amazon.fr", name: "Amazon.fr", authority: 97, style: "marketplace", hint: "Offres et avis." },
    { domain: "fnac.com", name: "Fnac", authority: 84, style: "marketplace", hint: "Stock et retrait." },
    { domain: "cdiscount.com", name: "Cdiscount", authority: 80, style: "marketplace", hint: "Prix agressifs." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventaire riche." },
    { domain: "leboncoin.fr", name: "Leboncoin", authority: 86, style: "marketplace", hint: "Annonces locales." },
    { domain: "darty.com", name: "Darty", authority: 78, style: "marketplace", hint: "SAV et stock." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Demande de marque." },
    { domain: "decathlon.fr", name: "Decathlon", authority: 82, style: "marketplace", hint: "Catégories sport." },
    { domain: "ebay.fr", name: "eBay", authority: 92, style: "marketplace", hint: "Profondeur d'offres." },
  ],
};

const ES: IntentPools = {
  informational: [
    { domain: "es.wikipedia.org", name: "Wikipedia", authority: 96, style: "encyclopedia", hint: "Cobertura enciclopédica." },
    { domain: "elpais.com", name: "El País", authority: 88, style: "news", hint: "Autoridad editorial." },
    { domain: "xataka.com", name: "Xataka", authority: 78, style: "guide", hint: "Guías tecnológicas." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Intención de vídeo." },
    { domain: "bbc.com", name: "BBC Mundo", authority: 92, style: "news", hint: "Medio global." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC." },
    { domain: "elmundo.es", name: "El Mundo", authority: 86, style: "news", hint: "Archivo y frescura." },
    { domain: "genbeta.com", name: "Genbeta", authority: 72, style: "guide", hint: "Tutoriales." },
    { domain: "rtve.es", name: "RTVE", authority: 80, style: "news", hint: "Medio público." },
  ],
  commercial: [
    { domain: "xataka.com", name: "Xataka", authority: 78, style: "review", hint: "Comparativas testadas." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Reviews globales." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Hilos 'mejor'." },
    { domain: "pccomponentes.com", name: "PcComponentes", authority: 76, style: "marketplace", hint: "Categorías profundas." },
    { domain: "elcorteingles.es", name: "El Corte Inglés", authority: 80, style: "marketplace", hint: "Retail de marca." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Volumen de opiniones." },
    { domain: "adslzone.net", name: "ADSLzone", authority: 70, style: "review", hint: "Comparadores locales." },
    { domain: "mediamarkt.es", name: "MediaMarkt", authority: 76, style: "marketplace", hint: "Electrónica." },
    { domain: "forocoches.com", name: "ForoCoches", authority: 74, style: "forum", hint: "Hilos de recomendación." },
  ],
  transactional: [
    { domain: "amazon.es", name: "Amazon.es", authority: 97, style: "marketplace", hint: "Ofertas y reseñas." },
    { domain: "elcorteingles.es", name: "El Corte Inglés", authority: 80, style: "marketplace", hint: "Stock y tienda." },
    { domain: "pccomponentes.com", name: "PcComponentes", authority: 76, style: "marketplace", hint: "Catálogo tech." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventario rico." },
    { domain: "mediamarkt.es", name: "MediaMarkt", authority: 76, style: "marketplace", hint: "Disponibilidad." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Demanda de marca." },
    { domain: "aliexpress.com", name: "AliExpress", authority: 90, style: "marketplace", hint: "Precio." },
    { domain: "carrefour.es", name: "Carrefour", authority: 74, style: "marketplace", hint: "Retail." },
    { domain: "ebay.es", name: "eBay", authority: 92, style: "marketplace", hint: "Listados." },
  ],
};

const IT: IntentPools = {
  informational: [
    { domain: "it.wikipedia.org", name: "Wikipedia", authority: 96, style: "encyclopedia", hint: "Copertura enciclopedica." },
    { domain: "repubblica.it", name: "la Repubblica", authority: 86, style: "news", hint: "Autorità editoriale." },
    { domain: "html.it", name: "HTML.it", authority: 70, style: "guide", hint: "Guide pratiche." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Intent video." },
    { domain: "corriere.it", name: "Corriere", authority: 88, style: "news", hint: "Archivio e freschezza." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC." },
    { domain: "hdblog.it", name: "HDblog", authority: 72, style: "guide", hint: "How-to tech." },
    { domain: "ilsole24ore.com", name: "Il Sole 24 Ore", authority: 84, style: "news", hint: "Business." },
    { domain: "focus.it", name: "Focus", authority: 74, style: "guide", hint: "Divulgazione." },
  ],
  commercial: [
    { domain: "hdblog.it", name: "HDblog", authority: 72, style: "review", hint: "Test e roundup." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Review globali." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Thread 'migliore'." },
    { domain: "trovaprezzi.it", name: "Trovaprezzi", authority: 74, style: "marketplace", hint: "Comparatore prezzi." },
    { domain: "mediaworld.it", name: "MediaWorld", authority: 76, style: "marketplace", hint: "Categorie retail." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Volume recensioni." },
    { domain: "subito.it", name: "Subito", authority: 78, style: "marketplace", hint: "Annunci." },
    { domain: "wired.it", name: "Wired Italia", authority: 76, style: "review", hint: "Comparativi." },
    { domain: "amazon.it", name: "Amazon.it", authority: 96, style: "marketplace", hint: "Schede prodotto." },
  ],
  transactional: [
    { domain: "amazon.it", name: "Amazon.it", authority: 97, style: "marketplace", hint: "Offerte e recensioni." },
    { domain: "mediaworld.it", name: "MediaWorld", authority: 76, style: "marketplace", hint: "Disponibilità." },
    { domain: "trovaprezzi.it", name: "Trovaprezzi", authority: 74, style: "marketplace", hint: "Aggregatore." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventario." },
    { domain: "subito.it", name: "Subito", authority: 78, style: "marketplace", hint: "Locale." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Brand." },
    { domain: "ebay.it", name: "eBay", authority: 92, style: "marketplace", hint: "Listing." },
    { domain: "decathlon.it", name: "Decathlon", authority: 80, style: "marketplace", hint: "Categorie." },
    { domain: "zalando.it", name: "Zalando", authority: 84, style: "marketplace", hint: "Fashion." },
  ],
};

const NL: IntentPools = {
  informational: [
    { domain: "nl.wikipedia.org", name: "Wikipedia", authority: 96, style: "encyclopedia", hint: "Encyclopedische dekking." },
    { domain: "nu.nl", name: "NU.nl", authority: 86, style: "news", hint: "Uitgeverij-autoriteit." },
    { domain: "tweakers.net", name: "Tweakers", authority: 82, style: "guide", hint: "Diepe tech-gidsen." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video-intent." },
    { domain: "nos.nl", name: "NOS", authority: 88, style: "news", hint: "Publieke omroep." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC." },
    { domain: "bright.nl", name: "Bright", authority: 70, style: "guide", hint: "How-tos." },
    { domain: "ad.nl", name: "AD", authority: 84, style: "news", hint: "Bereik." },
    { domain: "hardware.info", name: "Hardware.info", authority: 74, style: "guide", hint: "Uitleg en tests." },
  ],
  commercial: [
    { domain: "tweakers.net", name: "Tweakers", authority: 82, style: "review", hint: "Geteste roundups." },
    { domain: "kieskeurig.nl", name: "Kieskeurig", authority: 74, style: "review", hint: "Prijsvergelijk." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Software reviews." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "'Beste' threads." },
    { domain: "coolblue.nl", name: "Coolblue", authority: 82, style: "marketplace", hint: "Categoriepagina's." },
    { domain: "bol.com", name: "bol.com", authority: 88, style: "marketplace", hint: "Catalogusdiepte." },
    { domain: "consumentenbond.nl", name: "Consumentenbond", authority: 80, style: "review", hint: "Onafhankelijke tests." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Reviewvolume." },
    { domain: "mediamarkt.nl", name: "MediaMarkt", authority: 76, style: "marketplace", hint: "Retail." },
  ],
  transactional: [
    { domain: "bol.com", name: "bol.com", authority: 88, style: "marketplace", hint: "Aanbod en reviews." },
    { domain: "coolblue.nl", name: "Coolblue", authority: 82, style: "marketplace", hint: "Voorraad en service." },
    { domain: "amazon.nl", name: "Amazon.nl", authority: 94, style: "marketplace", hint: "Offers." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventaris." },
    { domain: "mediamarkt.nl", name: "MediaMarkt", authority: 76, style: "marketplace", hint: "Retail." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Merkvraag." },
    { domain: "zalando.nl", name: "Zalando", authority: 84, style: "marketplace", hint: "Fashion." },
    { domain: "marktplaats.nl", name: "Marktplaats", authority: 80, style: "marketplace", hint: "Lokaal." },
    { domain: "albert.nl", name: "Albert Heijn", authority: 78, style: "marketplace", hint: "Retailmerk." },
  ],
};

const EL: IntentPools = {
  informational: [
    { domain: "el.wikipedia.org", name: "Βικιπαίδεια", authority: 96, style: "encyclopedia", hint: "Entity coverage in Greek." },
    { domain: "in.gr", name: "in.gr", authority: 82, style: "news", hint: "Publisher authority and freshness." },
    { domain: "kathimerini.gr", name: "Καθημερινή", authority: 84, style: "news", hint: "Trusted news domain with deep archives." },
    { domain: "capital.gr", name: "Capital.gr", authority: 78, style: "guide", hint: "Explainers for finance and business queries." },
    { domain: "insomnia.gr", name: "Insomnia", authority: 72, style: "forum", hint: "Forum threads matching question phrasing." },
    { domain: "protothema.gr", name: "Πρώτο Θέμα", authority: 83, style: "news", hint: "High crawl frequency and fresh dates." },
    { domain: "naftemporiki.gr", name: "Ναυτεμπορική", authority: 79, style: "news", hint: "Business coverage with strong internal links." },
    { domain: "hubspot.com", name: "HubSpot", authority: 93, style: "guide", hint: "English guides still rank for mixed-language queries." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video intent blended into the SERP." },
  ],
  commercial: [
    { domain: "skroutz.gr", name: "Skroutz", authority: 86, style: "marketplace", hint: "Category pages with thousands of listings and reviews." },
    { domain: "bestprice.gr", name: "BestPrice", authority: 74, style: "marketplace", hint: "Price comparison with fresh offers." },
    { domain: "insomnia.gr", name: "Insomnia", authority: 72, style: "forum", hint: "'Ποιο είναι το καλύτερο' threads rank for best-of queries." },
    { domain: "techmaniacs.gr", name: "Techmaniacs", authority: 61, style: "review", hint: "Tested roundups for Greek buyers." },
    { domain: "capital.gr", name: "Capital.gr", authority: 78, style: "review", hint: "Publisher comparisons for services." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Global review authority bleeds into the Greek SERP." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC threads for 'best' queries." },
    { domain: "e-shop.gr", name: "e-shop.gr", authority: 70, style: "marketplace", hint: "Deep catalog and long-standing domain." },
    { domain: "plaisio.gr", name: "Πλαίσιο", authority: 71, style: "marketplace", hint: "Retail brand with strong category pages." },
  ],
  transactional: [
    { domain: "skroutz.gr", name: "Skroutz", authority: 86, style: "marketplace", hint: "Offer schema, reviews and price signals." },
    { domain: "public.gr", name: "Public", authority: 76, style: "marketplace", hint: "Availability and store pickup markup." },
    { domain: "e-shop.gr", name: "e-shop.gr", authority: 70, style: "marketplace", hint: "Massive listing depth." },
    { domain: "plaisio.gr", name: "Πλαίσιο", authority: 71, style: "marketplace", hint: "Retail authority with product schema." },
    { domain: "kotsovolos.gr", name: "Κωτσόβολος", authority: 73, style: "marketplace", hint: "Brand demand plus price competitiveness." },
    { domain: "bestprice.gr", name: "BestPrice", authority: 74, style: "marketplace", hint: "Aggregated offers with fresh prices." },
    { domain: "amazon.de", name: "Amazon.de", authority: 97, style: "marketplace", hint: "Cross-border authority for Greek shoppers." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Aggregated inventory with rich results." },
    { domain: "efood.gr", name: "efood", authority: 68, style: "brand", hint: "Local brand demand and app deep links." },
  ],
};

const PT: IntentPools = {
  informational: [
    { domain: "pt.wikipedia.org", name: "Wikipédia", authority: 96, style: "encyclopedia", hint: "Cobertura enciclopédica." },
    { domain: "globo.com", name: "Globo", authority: 90, style: "news", hint: "Autoridade editorial." },
    { domain: "tecmundo.com.br", name: "TecMundo", authority: 76, style: "guide", hint: "Guias práticos." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Intent de vídeo." },
    { domain: "uol.com.br", name: "UOL", authority: 88, style: "news", hint: "Arquivo e recência." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC." },
    { domain: "folha.uol.com.br", name: "Folha", authority: 86, style: "news", hint: "Jornalismo." },
    { domain: "canaltech.com.br", name: "Canaltech", authority: 72, style: "guide", hint: "How-tos." },
    { domain: "estadao.com.br", name: "Estadão", authority: 84, style: "news", hint: "Cobertura nacional." },
  ],
  commercial: [
    { domain: "reclameaqui.com.br", name: "Reclame Aqui", authority: 80, style: "review", hint: "Volume de avaliações." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Reviews globais." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Threads 'melhor'." },
    { domain: "buscape.com.br", name: "Buscapé", authority: 74, style: "marketplace", hint: "Comparador de preços." },
    { domain: "zoom.com.br", name: "Zoom", authority: 76, style: "marketplace", hint: "Ofertas agregadas." },
    { domain: "tecmundo.com.br", name: "TecMundo", authority: 76, style: "review", hint: "Comparativos." },
    { domain: "trustpilot.com", name: "Trustpilot", authority: 88, style: "review", hint: "Reviews." },
    { domain: "americanas.com.br", name: "Americanas", authority: 82, style: "marketplace", hint: "Categorias." },
    { domain: "magazineluiza.com.br", name: "Magalu", authority: 84, style: "marketplace", hint: "Retail forte." },
  ],
  transactional: [
    { domain: "mercadolivre.com.br", name: "Mercado Livre", authority: 92, style: "marketplace", hint: "Ofertas e reputação." },
    { domain: "amazon.com.br", name: "Amazon.com.br", authority: 94, style: "marketplace", hint: "Catálogo." },
    { domain: "magazineluiza.com.br", name: "Magalu", authority: 84, style: "marketplace", hint: "Varejo." },
    { domain: "americanas.com.br", name: "Americanas", authority: 82, style: "marketplace", hint: "Varejo." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Inventário." },
    { domain: "shopee.com.br", name: "Shopee", authority: 86, style: "marketplace", hint: "Preço." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Marca." },
    { domain: "casasbahia.com.br", name: "Casas Bahia", authority: 78, style: "marketplace", hint: "Retail." },
    { domain: "zoom.com.br", name: "Zoom", authority: 76, style: "marketplace", hint: "Comparador." },
  ],
};

const LANG_POOLS: Record<LangPack, IntentPools> = {
  en: EN,
  de: DE,
  fr: FR,
  es: ES,
  it: IT,
  nl: NL,
  el: EL,
  pt: PT,
};

const LOCAL_OVERLAY: Partial<Record<Market, Competitor[]>> = {
  uk: [
    { domain: "amazon.co.uk", name: "Amazon.uk", authority: 96, style: "marketplace", hint: "UK marketplace." },
    { domain: "bbc.co.uk", name: "BBC", authority: 96, style: "news", hint: "UK publisher." },
    { domain: "johnlewis.com", name: "John Lewis", authority: 80, style: "marketplace", hint: "UK retail." },
  ],
  ca: [
    { domain: "amazon.ca", name: "Amazon.ca", authority: 95, style: "marketplace", hint: "Canadian marketplace." },
    { domain: "bestbuy.ca", name: "Best Buy", authority: 82, style: "marketplace", hint: "CA retail." },
    { domain: "canadiantire.ca", name: "Canadian Tire", authority: 78, style: "marketplace", hint: "National retail." },
  ],
  au: [
    { domain: "amazon.com.au", name: "Amazon.au", authority: 94, style: "marketplace", hint: "AU marketplace." },
    { domain: "catch.com.au", name: "Catch", authority: 72, style: "marketplace", hint: "AU retail." },
    { domain: "jbhifi.com.au", name: "JB Hi-Fi", authority: 76, style: "marketplace", hint: "Electronics." },
  ],
  in: [
    { domain: "amazon.in", name: "Amazon.in", authority: 96, style: "marketplace", hint: "India marketplace." },
    { domain: "flipkart.com", name: "Flipkart", authority: 90, style: "marketplace", hint: "National catalog." },
    { domain: "nykaa.com", name: "Nykaa", authority: 74, style: "marketplace", hint: "Category leader." },
  ],
  mx: [
    { domain: "mercadolibre.com.mx", name: "Mercado Libre", authority: 90, style: "marketplace", hint: "MX marketplace." },
    { domain: "amazon.com.mx", name: "Amazon.mx", authority: 94, style: "marketplace", hint: "MX offers." },
    { domain: "liverpool.com.mx", name: "Liverpool", authority: 76, style: "marketplace", hint: "Retail MX." },
  ],
  ae: [
    { domain: "amazon.ae", name: "Amazon.ae", authority: 92, style: "marketplace", hint: "UAE marketplace." },
    { domain: "noon.com", name: "noon", authority: 80, style: "marketplace", hint: "Regional catalog." },
    { domain: "namshi.com", name: "Namshi", authority: 72, style: "marketplace", hint: "Regional retail." },
  ],
  de: [
    { domain: "amazon.de", name: "Amazon.de", authority: 98, style: "marketplace", hint: "DE marketplace." },
    { domain: "idealo.de", name: "Idealo", authority: 84, style: "marketplace", hint: "Price comparison." },
  ],
  br: [
    { domain: "mercadolivre.com.br", name: "Mercado Livre", authority: 92, style: "marketplace", hint: "BR marketplace." },
  ],
  gr: [
    { domain: "skroutz.gr", name: "Skroutz", authority: 86, style: "marketplace", hint: "Greek price comparison." },
    { domain: "bestprice.gr", name: "BestPrice", authority: 74, style: "marketplace", hint: "Greek comparison." },
  ],
};

function slug(kw: string) {
  return kw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");
}

export type SceneInput = {
  keyword: string;
  intent: SearchIntent;
  market: Market;
  seed: number;
  snapshot: SeoSnapshot;
};

function mergePool(market: Market, intent: Exclude<SearchIntent, "navigational">): Competitor[] {
  const lang = languageOf(market);
  const base = LANG_POOLS[lang][intent];
  const overlay = LOCAL_OVERLAY[market] ?? [];
  const seen = new Set<string>();
  const out: Competitor[] = [];
  for (const c of [...overlay, ...base]) {
    if (seen.has(c.domain)) continue;
    seen.add(c.domain);
    out.push(c);
  }
  return out;
}

/** Build the competitor set and SERP features for one keyword. Deterministic per seed. */
export function buildSerpScene(input: SceneInput): SerpResult[] {
  const { keyword: kw, intent, market, seed, snapshot } = input;
  const rnd = seeded(seed ^ 0x9e3779b9);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!;
  const yourDomain = hostOf(snapshot.finalUrl);
  const brand = yourDomain.split(".")[0] ?? yourDomain;
  const copy = getCopy(copyLangFor(kw, market));

  const poolIntent = intent === "navigational" ? "informational" : intent;
  const pool = mergePool(market, poolIntent).filter((c) => c.domain !== yourDomain);
  const shuffled = [...pool].sort(() => rnd() - 0.5).sort((a, b) => b.authority + rnd() * 18 - (a.authority + rnd() * 18));
  const competitors = shuffled.slice(0, 9);

  const out: SerpResult[] = [];

  if (intent === "informational") {
    const sources = competitors.slice(0, 3).map((c) => c.domain);
    out.push({
      id: `${seed}-ai`,
      kind: "ai-overview",
      domain: "google",
      url: "",
      title: "AI Overview",
      snippet: copy.aiOverview(kw),
      sitelinks: sources,
    });
    const top = competitors[0]!;
    out.push({
      id: `${seed}-featured`,
      kind: "featured",
      domain: top.domain,
      url: `https://${top.domain}/${slug(kw)}`,
      title: pick(copy.titles[top.style])(kw, top.name),
      snippet: copy.featured(kw),
      authority: top.authority,
      hint: top.hint,
    });
  }

  out.push({
    id: `${seed}-paa`,
    kind: "paa",
    domain: "google",
    url: "",
    title: "People also ask",
    snippet: "",
    questions: copy.paa[intent].map((f) => f(kw)),
  });

  if (intent === "navigational") {
    out.push({
      id: `${seed}-you`,
      kind: "organic",
      isYou: true,
      domain: yourDomain,
      url: snapshot.finalUrl,
      title: snapshot.title || `${cap(brand)} — official site`,
      snippet: snapshot.metaDescription || snapshot.ogDescription || `${cap(brand)}: ${snapshot.h1[0] ?? "official website"}.`,
      sitelinks: snapshot.h2.slice(0, 4).length >= 2 ? snapshot.h2.slice(0, 4) : ["Pricing", "Docs", "Sign in", "Blog"],
    });
  } else {
    out.push({
      id: `${seed}-you`,
      kind: "organic",
      isYou: true,
      domain: yourDomain,
      url: snapshot.finalUrl,
      title: snapshot.title || `${cap(kw)} | ${cap(brand)}`,
      snippet:
        snapshot.metaDescription ||
        snapshot.ogDescription ||
        (snapshot.h2.length ? snapshot.h2.slice(0, 3).join(". ") + "." : `${cap(brand)} on ${kw}.`),
    });
  }

  competitors.forEach((c, i) => {
    const title = pick(copy.titles[c.style])(kw, c.name);
    out.push({
      id: `${seed}-c${i}`,
      kind: "organic",
      domain: c.domain,
      url: `https://${c.domain}/${slug(kw)}${c.style === "forum" ? "/comments" : ""}`,
      title,
      snippet: pick(copy.snippets[c.style])(kw),
      authority: c.authority,
      hint: c.hint,
      sitelinks: i === 0 && intent !== "navigational" ? ["Overview", "Pricing", "Reviews", "Alternatives"] : undefined,
    });
  });

  return out;
}
