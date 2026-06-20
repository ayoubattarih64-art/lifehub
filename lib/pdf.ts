"use client";

/**
 * Dependency-free PDF generation.
 *
 * We render a self-contained, print-optimized HTML document into a hidden
 * iframe and invoke the browser's native "Save as PDF" via window.print().
 * This keeps the bundle small while producing high-quality, vector PDFs.
 */

export interface PdfSection {
  /** Optional section heading. */
  heading?: string;
  /** Plain-text or simple HTML body. */
  body?: string;
  /** Optional image data URLs to render in a grid. */
  images?: string[];
  /** Optional small meta line (e.g. date, location). */
  meta?: string;
}

export interface PdfDocument {
  title: string;
  subtitle?: string;
  /** Accent color used for headings (CSS color). */
  accent?: string;
  /** Cover image data URL. */
  cover?: string;
  sections: PdfSection[];
  /** Footer text shown on the document. */
  footer?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderSection(section: PdfSection): string {
  const heading = section.heading
    ? `<h2 class="section-title">${escapeHtml(section.heading)}</h2>`
    : "";
  const meta = section.meta
    ? `<p class="meta">${escapeHtml(section.meta)}</p>`
    : "";
  const body = section.body
    ? `<p class="body">${escapeHtml(section.body).replace(/\n/g, "<br/>")}</p>`
    : "";
  const images =
    section.images && section.images.length
      ? `<div class="grid">${section.images
          .map((src) => `<img src="${src}" alt="" />`)
          .join("")}</div>`
      : "";
  return `<section class="section">${heading}${meta}${body}${images}</section>`;
}

function buildHtml(doc: PdfDocument): string {
  const accent = doc.accent ?? "#6366f1";
  const cover = doc.cover
    ? `<div class="cover-image" style="background-image:url('${doc.cover}')"></div>`
    : "";
  const subtitle = doc.subtitle
    ? `<p class="subtitle">${escapeHtml(doc.subtitle)}</p>`
    : "";
  const footer = doc.footer
    ? `<footer class="doc-footer">${escapeHtml(doc.footer)}</footer>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(doc.title)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.6;
  }
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 80vh;
    page-break-after: always;
  }
  .cover-image {
    width: 100%;
    height: 320px;
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    margin-bottom: 32px;
  }
  h1 { font-size: 42px; margin: 0 0 8px; color: ${accent}; }
  .subtitle { font-size: 18px; color: #555; margin: 0; }
  .section { page-break-inside: avoid; margin-bottom: 28px; }
  .section-title {
    font-size: 24px;
    color: ${accent};
    border-bottom: 2px solid ${accent}22;
    padding-bottom: 6px;
    margin: 0 0 8px;
  }
  .meta { font-size: 13px; color: #888; font-style: italic; margin: 0 0 8px; }
  .body { font-size: 15px; margin: 0 0 12px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .grid img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
  .doc-footer {
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    font-size: 12px;
    color: #999;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="cover">
    ${cover}
    <h1>${escapeHtml(doc.title)}</h1>
    ${subtitle}
  </div>
  ${doc.sections.map(renderSection).join("")}
  ${footer}
</body>
</html>`;
}

/**
 * Open a hidden iframe with the rendered document and trigger printing.
 * The user can then "Save as PDF" from the print dialog.
 */
export function generatePdf(doc: PdfDocument): void {
  if (typeof window === "undefined") return;

  const html = buildHtml(doc);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const idoc = iframe.contentWindow?.document;
  if (!idoc) {
    document.body.removeChild(iframe);
    return;
  }

  idoc.open();
  idoc.write(html);
  idoc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };

  // Give the browser a moment to lay out images before printing.
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    cleanup();
  }, 400);
}
