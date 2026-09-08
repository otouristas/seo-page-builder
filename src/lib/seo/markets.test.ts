import { describe, expect, it } from "vitest";
import { inferMarket, isMarket, languageOf, MARKET_IDS } from "./markets";

describe("markets", () => {
  it("has fourteen locales", () => {
    expect(MARKET_IDS).toHaveLength(14);
    for (const id of MARKET_IDS) expect(isMarket(id)).toBe(true);
  });

  it("rejects unknown ids", () => {
    expect(isMarket("jp")).toBe(false);
    expect(isMarket("gr")).toBe(true);
  });

  it("infers from navigator-like tags", () => {
    expect(inferMarket(["el-GR"])).toBe("gr");
    expect(inferMarket(["de-DE"])).toBe("de");
    expect(inferMarket(["en-GB"])).toBe("uk");
    expect(inferMarket(["pt-BR"])).toBe("br");
    expect(inferMarket(["en-US"])).toBe("us");
    expect(inferMarket(["fr"])).toBe("fr");
    expect(inferMarket(["xx"])).toBe("us");
  });

  it("maps language packs", () => {
    expect(languageOf("gr")).toBe("el");
    expect(languageOf("br")).toBe("pt");
    expect(languageOf("ae")).toBe("en");
    expect(languageOf("mx")).toBe("es");
  });
});
