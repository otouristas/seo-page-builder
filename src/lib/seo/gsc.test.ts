import { describe, expect, it } from "vitest";
import { parseGscExport } from "./gsc";

describe("gsc parse", () => {
  it("parses English headers", () => {
    const rows = parseGscExport(`Query,Clicks,Impressions,CTR,Position
payment processing,10,1000,1,6`);
    expect(rows[0]?.query).toBe("payment processing");
    expect(rows[0]?.impressions).toBe(1000);
  });

  it("parses German headers", () => {
    const rows = parseGscExport(`Anfrage,Klicks,Impressionen,CTR,Position
zahlungsabwicklung,4,800,2,5`);
    expect(rows[0]?.query).toBe("zahlungsabwicklung");
    expect(rows[0]?.clicks).toBe(4);
  });

  it("parses Greek headers", () => {
    const rows = parseGscExport(`Ερώτημα,Κλικ,Εμφανίσεις,CTR,Θέση
τιμή laptop,3,200,1.5,8`);
    expect(rows[0]?.query).toBe("τιμή laptop");
  });

  it("parses Spanish headers", () => {
    const rows = parseGscExport(`Consulta,Clics,Impresiones,CTR,Posición
mejor crm,2,150,1,9`);
    expect(rows[0]?.query).toBe("mejor crm");
  });
});
