import { describe, it, expect } from "vitest";
import { parseSnapshot, compareSnapshots } from "@/lib/seo/audit";
import { normalizePublicUrl, isPublicAddress } from "@/lib/seo/safe-fetch";
import { parseGscCsv, summarizeGsc } from "@/lib/seo/gsc";
import { validateStructuredData } from "@/lib/seo/schema";
import { toCsv } from "@/lib/utils";
import {
  propertyMatchesWebsite,
  completeDate,
  dateWindow,
} from "@/lib/integrations/gsc";
const html =
  '<html lang="en"><head><title>Contact</title><meta name="robots" content="noindex"><link rel="canonical" href="https://example.com/contact"><meta name="viewport" content="width=device-width"></head><body><main><h1>Contact</h1><h1>Visit us</h1><p>Send our team a question.</p><img src="decoration.png" alt=""><a href="/">Home</a></main></body></html>';
describe("Contextual evidence, rather than synthetic ranking rules", () => {
  it("handles intentional canonicalization, short pages, headings and decoration", () => {
    const s = parseSnapshot(html, "https://example.com/contact?source=search");
    expect(s.findings.find((f) => f.id === "canonical")?.status).toBe("pass");
    expect(s.findings.find((f) => f.id === "headings")?.status).toBe("pass");
    expect(s.findings.find((f) => f.id === "alt")?.status).toBe("pass");
    expect(s.findings.find((f) => f.id === "robots")?.detail).toContain(
      "intentional",
    );
    expect(
      s.findings.find((f) => f.id === "readable")?.recommendation,
    ).toContain("no universal minimum");
    expect(s.findings.find((f) => f.id === "authorship")?.status).toBe(
      "unknown",
    );
  });
  it("only verifies previously observed issues that now pass", () => {
    const before = parseSnapshot(html, "https://example.com");
    const after = parseSnapshot(
      html.replace(
        "</head>",
        '<meta name="description" content="Speak to the team."></head>',
      ),
      "https://example.com",
    );
    expect(compareSnapshots(before, after).resolved).toEqual(["description"]);
    expect(compareSnapshots(before, after).note).toContain("not proof");
  });
  it("keeps malformed markup and missing evidence distinct", () => {
    const r = validateStructuredData('{"@type":"Product",');
    expect(r.validJson).toBe(false);
    expect(r.issues[0].level).toBe("error");
    const review = validateStructuredData(
      '{"@context":"https://schema.org","@type":"Organization","name":"Unproven award winner","url":"https://example.com"}',
      "We sell coffee.",
    );
    expect(review.issues.some((i) => i.message.includes("not matched"))).toBe(
      true,
    );
  });
});
describe("Public network boundary", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "192.168.1.1",
    "0.0.0.0",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "224.0.0.1",
  ])("rejects reserved address %s", (ip) =>
    expect(isPublicAddress(ip)).toBe(false),
  );
  it.each([
    "http://localhost",
    "http://127.1",
    "http://2130706433",
    "http://[::ffff:127.0.0.1]",
    "https://user:pass@example.com",
    "https://example.com:9000",
    "file:///etc/passwd",
    "ftp://example.com",
    "https://server.internal",
  ])("rejects unsafe URL %s", (url) =>
    expect(() => normalizePublicUrl(url)).toThrow(),
  );
  it("allows a normalized public page", () => {
    expect(normalizePublicUrl("example.com/page#one").href).toBe(
      "https://example.com/page",
    );
    expect(isPublicAddress("1.1.1.1")).toBe(true);
  });
});
describe("Search Console datasets", () => {
  it("does not add detail or CSV rows to property totals", () => {
    const totals = Array.from({ length: 56 }, (_, i) => {
      const d = new Date("2026-01-01T12:00:00Z");
      d.setUTCDate(i + 1);
      return {
        date: d.toISOString().slice(0, 10),
        dataset: "totals",
        query: "",
        page: "",
        country: "",
        device: "",
        clicks: 10,
        impressions: 100,
        position: 5,
      };
    });
    const r = summarizeGsc([
      ...totals,
      { ...totals[55], dataset: "detail", clicks: 999 },
      { ...totals[55], dataset: "csv", clicks: 999 },
    ])!;
    expect(r.current.clicks).toBe(280);
    expect(r.previous.clicks).toBe(280);
    expect(r.current.ctr).toBe(0.1);
    expect(r.complete).toBe(true);
  });
  it("labels incomplete comparisons", () =>
    expect(
      summarizeGsc([
        {
          date: "2026-01-01",
          dataset: "totals",
          query: "",
          page: "",
          country: "",
          device: "",
          clicks: 0,
          impressions: 0,
          position: 0,
        },
      ])?.complete,
    ).toBe(false));
  it("parses quoted CSV and rejects invalid dates or metrics", () => {
    expect(
      parseGscCsv(
        'Date,Clicks,Impressions,Position,Query\n2026-02-01,2,100,4,"tea, green"',
      )[0].query,
    ).toBe("tea, green");
    expect(() =>
      parseGscCsv("Date,Clicks,Impressions,Position\n2026-02-30,2,100,4"),
    ).toThrow();
    expect(() =>
      parseGscCsv("Date,Clicks,Impressions,Position\n2026-02-01,-2,100,4"),
    ).toThrow();
  });
  it("matches domain boundaries and reports in Pacific dates", () => {
    expect(
      propertyMatchesWebsite(
        "sc-domain:example.com",
        "https://www.example.com/",
      ),
    ).toBe(true);
    expect(
      propertyMatchesWebsite(
        "sc-domain:example.com",
        "https://notexample.com/",
      ),
    ).toBe(false);
    expect(
      propertyMatchesWebsite(
        "https://example.com/blog/",
        "https://example.com/blogroll/",
      ),
    ).toBe(false);
    expect(completeDate(new Date("2026-09-09T01:00:00Z"))).toBe("2026-09-05");
    expect(dateWindow(90)).toHaveLength(90);
  });
  it("neutralizes spreadsheet formulas in exports", () =>
    expect(toCsv([{ query: '=HYPERLINK("bad")' }])).toContain("'=HYPERLINK"));
});
