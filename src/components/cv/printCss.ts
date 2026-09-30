/**
 * Print stylesheet of the web CV, rendered by the page in a <style> element
 * (deterministic string: identical on the server and the client).
 *
 *  - A4, 12 mm margins, running footer with the web address and page numbers;
 *  - light tokens forced even when the site is in dark mode;
 *  - toolbar and controls hidden, collapsed entries expanded;
 *  - two columns (main / side), entries never split across pages;
 *  - external links print their address discreetly.
 */

/** Escape a value for a CSS string literal. */
const cssString = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;

const LIGHT_TOKENS = `
    --c-bg: 255 255 255;
    --c-bg-2: 244 242 238;
    --c-surface: 255 255 255;
    --c-ink: 14 14 15;
    --c-ink-2: 74 72 68;
    --c-ink-3: 107 104 98;
    --c-line: 214 210 201;
    --c-accent: 226 61 30;
    --c-accent-ink: 179 42 14;
    color-scheme: light !important;`;

const MONO = `'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace`;

export const buildPrintCss = (footer: string) => `
@page {
  size: A4;
  margin: 11mm 11mm 13mm;
  @bottom-left {
    content: ${cssString(footer)};
    font-family: ${MONO};
    font-size: 6.5pt;
    letter-spacing: 0.04em;
    color: rgb(107 104 98);
    vertical-align: top;
    padding-top: 3mm;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: ${MONO};
    font-size: 6.5pt;
    color: rgb(107 104 98);
    vertical-align: top;
    padding-top: 3mm;
  }
}

@media print {
  :root, :root.dark, .dark {${LIGHT_TOKENS}
  }
  html { font-size: 9.4pt !important; background: #fff !important; }
  body {
    background: #fff !important;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cv-page { min-height: 0 !important; background: #fff !important; }
  .cv-noprint, .cv-toolbar, .cv-crop, .cv-footer, .cv-actions, .cv-skip { display: none !important; }
  .cv-main { padding: 0 !important; }
  .cv-frame { padding: 0 !important; max-width: none !important; }
  .cv-sheet { border: 0 !important; padding: 0 !important; background: none !important; animation: none !important; }
  .cv-more { display: block !important; animation: none !important; }

  /* Header: name on one line, portrait on the right */
  .cv-head > div:first-child { padding-bottom: 1.6mm !important; }
  .cv-head > div:nth-child(2) { margin-top: 4.5mm !important; flex-direction: row !important; align-items: flex-end !important; justify-content: space-between !important; gap: 6mm !important; }
  .cv-name { font-size: 23pt !important; line-height: 0.9 !important; }
  .cv-name > span { display: inline !important; }
  .cv-role { font-size: 11.5pt !important; margin-top: 2.2mm !important; max-width: none !important; }
  .cv-portrait { order: 0 !important; width: 19mm !important; height: 19mm !important; }
  .cv-contact { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; column-gap: 6mm !important; margin-top: 3.5mm !important; }
  .cv-contact-item { padding: 1.2mm 0 !important; }
  .cv-contact dd { font-size: 8.6pt !important; margin-top: 0.3mm !important; }

  /* Two columns */
  .cv-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) 60mm !important;
    grid-template-rows: auto auto !important;
    align-items: start !important;
    column-gap: 8mm !important;
    row-gap: 4mm !important;
    margin-top: 5mm !important;
  }
  .cv-main-top { grid-column: 1 !important; grid-row: 1 !important; }
  .cv-side { grid-column: 2 !important; grid-row: 1 / span 2 !important; }
  .cv-main-bottom { grid-column: 1 !important; grid-row: 2 !important; }
  .cv-col > * + * { margin-top: 4mm !important; }

  /* Sections and entries */
  .cv-section-head { padding-top: 1.2mm !important; break-after: avoid; page-break-after: avoid; }
  .cv-h2 { font-size: 10.2pt !important; }
  .cv-section-body { margin-top: 1.8mm !important; }
  .cv-entry { break-inside: avoid; page-break-inside: avoid; }
  .cv-entry.border-t, .cv-entry.border-b { padding-top: 1.25mm !important; padding-bottom: 1.25mm !important; }
  .cv-entry.first\\:pt-0:first-child { padding-top: 0 !important; }
  .cv-entry-meta { line-height: 1.3 !important; }
  .cv-wide { grid-template-columns: 19mm minmax(0, 1fr) !important; column-gap: 4mm !important; row-gap: 0 !important; }
  .cv-meta-extra { display: none !important; }
  .cv-print-meta { display: inline !important; }
  .cv-doc .label { font-size: 6.4pt !important; }
  .cv-doc h3 { font-size: 9.2pt !important; }
  .cv-doc h3 + p { font-size: 8.6pt !important; margin-top: 0 !important; }
  .cv-summary { font-size: 9.2pt !important; line-height: 1.48 !important; max-width: none !important; }
  .cv-desc { margin-top: 0.4mm !important; font-size: 8.3pt !important; line-height: 1.36 !important; max-width: none !important; }
  .cv-project { min-height: 0 !important; padding: 1mm 0 !important; font-size: 9pt !important; line-height: 1.3 !important; }
  .cv-project-tagline { font-size: 8.3pt !important; }
  .cv-more > h3 { margin-top: 2.6mm !important; margin-bottom: 1.6mm !important; break-after: avoid; page-break-after: avoid; }
  .cv-link-row { margin-top: 0.3mm !important; }

  /* Secondary entries (other roles, engagement, media): title and subtitle on one line */
  .cv-more .cv-wide > div:last-child, .cv-main-bottom .cv-wide > div:last-child { font-size: 8.6pt !important; line-height: 1.38 !important; }
  .cv-more .cv-wide h3, .cv-main-bottom .cv-wide h3 { display: inline !important; line-height: inherit !important; }
  .cv-more .cv-wide h3 + p, .cv-main-bottom .cv-wide h3 + p { display: inline !important; line-height: inherit !important; }
  .cv-more .cv-wide h3 + p::before, .cv-main-bottom .cv-wide h3 + p::before { content: " · "; color: rgb(var(--c-ink-3)); }

  /* Side column: always the narrow stacked layout (tablet grids off) */
  .cv-side .cv-side-entry { display: block !important; padding-top: 1.2mm !important; padding-bottom: 1.2mm !important; }
  .cv-side .cv-side-entry:first-child { padding-top: 0 !important; }
  .cv-side .cv-side-entry > .label { margin-bottom: 0.6mm !important; }
  .cv-side .cv-side-entry p:not(.label) { margin-top: 0.4mm !important; font-size: 8pt !important; line-height: 1.34 !important; }
  .cv-side .cv-side-entry p.label { margin-top: 0.8mm !important; }
  .cv-pairs, .cv-groups { display: block !important; }
  .cv-pairs > li:nth-child(2) { border-top-width: 1px !important; padding-top: 1.2mm !important; }
  .cv-groups > * + * { margin-top: 1.5mm !important; }
  .cv-inline { font-size: 8.2pt !important; line-height: 1.34 !important; }
  .cv-inline + .cv-inline { margin-top: 1mm !important; }
  .cv-groups h3.label { margin-bottom: 0.4mm !important; }
  .cv-cefr { margin-top: 0.8mm !important; }
  .cv-side .cv-more .cv-side-entry > div:last-child { font-size: 8pt !important; line-height: 1.34 !important; }
  .cv-side .cv-more .cv-side-entry h3 { display: inline !important; line-height: inherit !important; }
  .cv-side .cv-more .cv-side-entry h3 + p { display: inline !important; line-height: inherit !important; }
  .cv-side .cv-more .cv-side-entry h3 + p::before { content: " · "; color: rgb(var(--c-ink-3)); }
  .cv-level { font-size: 8pt !important; }
  .cv-groups > .cv-entry { font-size: 8.2pt !important; line-height: 1.34 !important; }
  .cv-groups > .cv-entry > h3.label { display: inline !important; margin: 0 1.5mm 0 0 !important; line-height: inherit !important; }
  .cv-groups > .cv-entry > .cv-inline { display: inline !important; }
  .cv-permit > span { display: inline !important; }
  .cv-permit > .label { margin-left: 1.5mm; }

  /* Links: no underline, address printed discreetly */
  .link, .link-static { background-image: none !important; }
  [data-print-url]::after {
    content: " · " attr(data-print-url);
    font-family: ${MONO};
    font-size: 6.4pt;
    color: rgb(var(--c-ink-3));
    white-space: nowrap;
  }
  .cv-url > .link { display: none !important; }
  .cv-url::after { content: attr(data-print-url) !important; }
}
`;
