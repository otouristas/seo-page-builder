import { describe, expect, it } from "vitest";
import { decodePlays, encodePlays, resolvePlayIds } from "./share";

describe("share", () => {
  it("round-trips play keys", () => {
    const nicheId = "n-abc123";
    const plays = [
      { id: `${nicheId}-title` },
      { id: `${nicheId}-title-kw` },
      { id: `${nicheId}-faq` },
    ];
    const encoded = encodePlays(plays.map((p) => p.id), nicheId);
    expect(encoded).toBe("title,title-kw,faq");
    const keys = decodePlays(encoded);
    expect(resolvePlayIds(keys, nicheId, plays).sort()).toEqual(plays.map((p) => p.id).sort());
  });

  it("ignores junk keys", () => {
    expect(decodePlays("")).toEqual([]);
    expect(decodePlays("title,,faq")).toEqual(["title", "faq"]);
  });
});
