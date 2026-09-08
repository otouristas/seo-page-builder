// Build one .docx per GLM article from articles.json
const fs = require("fs"), path = require("path");
const D = require("docx");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, LevelFormat, ExternalHyperlink, PageBreak, Footer, PageNumber } = D;

const [,, jsonPath, outDir] = process.argv;
const articles = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const PAGE_W = 11906, MARGIN = 1440, CONTENT_W = PAGE_W - 2 * MARGIN; // A4, DXA
const FONT = "Calibri", INK = "1F2937", MUTED = "6B7280", ACCENT = "0F4C5C", LINK = "0B5394";

function inline(text, base = {}) {
  const runs = []; const re = /(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/g; let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith("**")) runs.push(new TextRun({ text: tok.slice(2, -2), bold: true, ...base }));
    else { const mm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      runs.push(new ExternalHyperlink({ link: mm[2], children: [new TextRun({ text: mm[1], color: LINK, underline: {}, ...base })] })); }
    last = m.index + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...base }));
  return runs;
}
const para = (text, opts = {}) => new Paragraph({ children: inline(text), spacing: { after: 160, line: 300 }, ...opts });
const label = (t) => new Paragraph({ children: [new TextRun({ text: t, bold: true, color: ACCENT, size: 18, allCaps: true })], spacing: { before: 240, after: 80 } });

function metaTable(rows) {
  const w = [2300, CONTENT_W - 2300];
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w,
    rows: rows.map(([k, v], i) => new TableRow({ children: [
      new TableCell({ width: { size: w[0], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "F3F4F6", color: "auto" },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })] }),
      new TableCell({ width: { size: w[1], type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: (Array.isArray(v) ? v : [v]).map(x => new Paragraph({ children: inline(String(x), { size: 20 }) })) }),
    ] })) });
}
function bodyTable(rows) {
  const n = rows[0].length, cw = Math.floor(CONTENT_W / n), w = Array(n).fill(cw); w[n - 1] += CONTENT_W - cw * n;
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w,
    rows: rows.map((r, ri) => new TableRow({ tableHeader: ri === 0, children: r.map((c, ci) => new TableCell({
      width: { size: w[ci], type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
      shading: ri === 0 ? { type: ShadingType.CLEAR, fill: "E5E7EB", color: "auto" } : undefined,
      children: [new Paragraph({ children: inline(c, { bold: ri === 0, size: 21 }) })] })) })) });
}

function buildArticle(a) {
  const m = a.meta, children = [];
  // ---- Page 1: cover + SEO metadata
  children.push(new Paragraph({ children: [new TextRun({ text: `GLM Outdoor Solutions  ·  Blog article ${m.article}  ·  Draft for review`, color: MUTED, size: 18 })], spacing: { after: 240 } }));
  children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: m.title })], spacing: { after: 120 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: `${m.word_count.toLocaleString()} words  ·  Primary keyword: ${m.primary_keyword}`, color: MUTED, size: 20, italics: true })], spacing: { after: 320 } }));
  children.push(label("SEO metadata"));
  children.push(metaTable([
    ["Meta title", `${m.meta_title}  (${m.meta_title.length} characters)`],
    ["Meta description", `${m.meta_description}  (${m.meta_description.length} characters)`],
    ["URL slug", m.slug],
    ["Primary keyword", m.primary_keyword],
    ["Secondary keywords", m.secondary_keywords.join(", ")],
    ["Publish order", m.publish_order],
    ["Schema", m.schema],
  ]));
  children.push(label("Internal links to include"));
  m.internal_links.forEach(u => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 },
    children: [new ExternalHyperlink({ link: u, children: [new TextRun({ text: u, color: LINK, underline: {}, size: 20 })] })] })));
  children.push(label("Image brief"));
  const ib = m.image_brief; const imgs = [["Hero", ib.hero], ...(ib.diagrams || ib.supporting || []).map((d, i) => [`${ib.diagrams ? "Diagram" : "Supporting image"} ${i + 1}`, d])];
  imgs.forEach(([k, v]) => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: k + ": ", bold: true, size: 20 }), new TextRun({ text: v, size: 20 })] })));
  children.push(new Paragraph({ children: [new PageBreak()] }));
  // ---- Article body
  let numInstance = 0;
  for (const b of a.blocks) {
    if (b.type === "heading") {
      const lvl = b.level === 1 ? HeadingLevel.HEADING_1 : b.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
      children.push(new Paragraph({ heading: lvl, children: inline(b.text) }));
    } else if (b.type === "para") children.push(para(b.text));
    else if (b.type === "bullets") b.items.forEach(t => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: inline(t), spacing: { after: 100, line: 300 } })));
    else if (b.type === "numbered") { numInstance++; b.items.forEach(t => children.push(new Paragraph({ numbering: { reference: "numbers", level: 0, instance: numInstance }, children: inline(t), spacing: { after: 100, line: 300 } }))); }
    else if (b.type === "table") { children.push(bodyTable(b.rows)); children.push(new Paragraph({ spacing: { after: 120 } })); }
  }
  return new Document({
    creator: "GLM Outdoor Solutions", title: m.title,
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: INK } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 44, bold: true, color: ACCENT }, paragraph: { spacing: { after: 120 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 36, bold: true, color: ACCENT }, paragraph: { spacing: { before: 0, after: 240 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 28, bold: true, color: INK }, paragraph: { spacing: { before: 360, after: 140 }, outlineLevel: 1, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 24, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2, keepNext: true } },
      ] },
    numbering: { config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    ] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "GLM Outdoor Solutions  ·  ", color: MUTED, size: 16 }),
        new TextRun({ text: m.meta_title.replace(" | GLM", ""), color: MUTED, size: 16 }),
        new TextRun({ text: "  ·  Page ", color: MUTED, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16 }),
        new TextRun({ text: " of ", color: MUTED, size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, size: 16 }) ] })] }) },
      children,
    }],
  });
}

const names = {
  "01": "GLM Article 1 - Retractable Glass Roof Systems.docx",
  "02": "GLM Article 2 - Angled Pergolas for Irregular Plans.docx",
  "03": "GLM Article 3 - ZIP Screens for Pergolas.docx",
  "04": "GLM Article 4 - Pergola Louvers Explained.docx",
};
(async () => {
  for (const a of articles) {
    const out = path.join(outDir, names[a.source.slice(0, 2)]);
    fs.writeFileSync(out, await Packer.toBuffer(buildArticle(a)));
    console.log("wrote", out);
  }
})();
