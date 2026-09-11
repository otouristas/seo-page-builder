import { describe, it, expect } from "vitest";
import { parseSiteProfile, nameFromHostname } from "@/lib/seo/site-profile";
import { projectLimitMessage, planLabel } from "@/lib/plans";
describe("A website describes itself, so setup does not retype it", () => {
  it("prefers what the website declares about itself", () => {
    const profile = parseSiteProfile(
      '<html lang="el-GR"><head><title>Αρχική | Ελιά &amp; Γη</title>' +
        '<meta property="og:site_name" content="Ελιά &amp; Γη">' +
        '<meta name="description" content="Ελαιόλαδο από την Κρήτη.">' +
        '<link rel="apple-touch-icon" href="/brand/touch.png">' +
        "</head><body></body></html>",
      "https://eliagi.gr/",
    );
    expect(profile.name).toBe("Ελιά & Γη");
    expect(profile.description).toBe("Ελαιόλαδο από την Κρήτη.");
    expect(profile.logo).toBe("https://eliagi.gr/brand/touch.png");
    expect(profile.language).toBe("el");
    expect(profile.country).toBe("GR");
    expect(profile.found).toEqual([
      "name",
      "description",
      "logo",
      "language",
      "country",
    ]);
  });
  it("reads an organization out of a JSON-LD graph", () => {
    const profile = parseSiteProfile(
      "<html><head><title>Widgets</title>" +
        '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Ignore me"},{"@type":["LocalBusiness","Store"],"name":"Acme Widgets","description":"Handmade widgets for small workshops.","logo":{"@type":"ImageObject","url":"https://cdn.example.com/acme.svg"}}]}</script>' +
        "</head><body></body></html>",
      "https://acme.example/",
    );
    expect(profile.name).toBe("Acme Widgets");
    expect(profile.description).toBe("Handmade widgets for small workshops.");
    expect(profile.logo).toBe("https://cdn.example.com/acme.svg");
  });
  it("falls back to the title segment that matches the domain", () => {
    const profile = parseSiteProfile(
      "<html><head><title>Home | Acme Bakery</title></head><body></body></html>",
      "https://acmebakery.co.uk/",
    );
    expect(profile.name).toBe("Acme Bakery");
    expect(profile.country).toBe("GB");
    /* A guessed favicon is a display fallback, not a declared logo. */
    expect(profile.logo).toBe("https://acmebakery.co.uk/favicon.ico");
    expect(profile.found).toEqual(["country"]);
  });
  it("does not read a market into a generic namespace or broken markup", () => {
    const profile = parseSiteProfile(
      '<html><head><title>Ship It</title><script type="application/ld+json">{"@type":</script></head><body></body></html>',
      "https://shipit.io/",
    );
    expect(profile.country).toBe("");
    expect(profile.language).toBe("");
    expect(profile.name).toBe("Ship It");
  });
  it("never returns a logo address that is not http", () => {
    const profile = parseSiteProfile(
      '<html><head><link rel="icon" href="javascript:alert(1)"><title>X</title></head><body></body></html>',
      "https://example.com/",
    );
    expect(profile.logo).toBe("https://example.com/favicon.ico");
    expect(profile.found).not.toContain("logo");
  });
  it("names a project from its domain when nothing else is available", () => {
    expect(nameFromHostname("www.olive-earth.example")).toBe("Olive Earth");
  });
});
describe("A reached project allowance explains itself", () => {
  it("names the plan, the limit and the way forward", () => {
    expect(projectLimitMessage("free", 1)).toContain(
      "Your Free plan includes 1 project",
    );
    expect(projectLimitMessage("free", 1)).toContain("upgrade your plan");
    expect(projectLimitMessage("nigiri", 3)).toContain(
      "Nigiri plan includes 3 projects",
    );
    expect(planLabel("maki", "trial")).toBe("$1 trial");
  });
});
