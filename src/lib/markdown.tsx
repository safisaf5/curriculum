import { useMemo, type ReactNode } from 'react';
import type { Lang } from '../data/types';
import { SmartLink } from '../components/ui/SmartLink';
import { cn } from './cn';
import { typo } from './text';

/**
 * Small, safe Markdown → React renderer for the notes (/src/content/notes).
 *
 * Supported: ## / ### headings (a single # is demoted: the page owns the h1),
 * paragraphs, **bold**, *italic*, `inline code`, fenced code blocks,
 * [links](…), ![images](…), - / 1. lists (nested by indentation),
 * > blockquotes, --- rules, hard line breaks (two trailing spaces or "\").
 *
 * Safety: output is plain React elements (no dangerouslySetInnerHTML, raw
 * HTML is printed as text). Links accept http(s), mailto and site-relative
 * paths only, anything else is rendered as plain text. Images accept
 * site-relative sources only (the CSP blocks external images).
 * Optional image size and caption: ![alt](/images/x.jpg =1200x800 "Caption").
 */

// ── Block model ──────────────────────────────────────────────────────────

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; info: string; code: string }
  | { type: 'list'; ordered: boolean; start: number; items: Block[][] }
  | { type: 'quote'; blocks: Block[] }
  | { type: 'hr' };

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const UL = /^( {0,3})([-*+])\s+(.*)$/;
const OL = /^( {0,3})(\d{1,9})[.)]\s+(.*)$/;

const indentOf = (line: string) => (line.match(/^ */)?.[0].length ?? 0);

const isBlockStart = (line: string) =>
  FENCE.test(line) || HEADING.test(line) || HR.test(line) || QUOTE.test(line) || UL.test(line) || OL.test(line);

/** Remove up to `n` leading spaces. */
const dedent = (line: string, n: number) => line.replace(new RegExp(`^ {0,${n}}`), '');

const parseBlocks = (lines: string[]): Block[] => {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Fenced code block (unclosed fences run to the end, like CommonMark)
    const fence = line.match(FENCE);
    if (fence) {
      const marker = fence[1];
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', info: fence[2], code: body.join('\n') });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length <= 2 ? 2 : 3, text: heading[2] });
      i += 1;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const q = lines[i].match(QUOTE);
        // Lazy continuation: a plain text line continues the quote's paragraph
        if (!q && isBlockStart(lines[i])) break;
        inner.push(q ? q[1] : lines[i]);
        i += 1;
      }
      blocks.push({ type: 'quote', blocks: parseBlocks(inner) });
      continue;
    }

    const listMatch = line.match(UL) ?? line.match(OL);
    if (listMatch) {
      const ordered = OL.test(line);
      const pattern = ordered ? OL : UL;
      const base = indentOf(line);
      const items: string[][] = [];
      let current: string[] = [];
      let contentIndent = 2;

      while (i < lines.length) {
        const l = lines[i];
        const m = l.match(pattern);
        if (m && indentOf(l) <= base + 1) {
          current = [m[3]];
          items.push(current);
          contentIndent = m[1].length + m[2].length + 1 + (ordered ? 1 : 0);
          i += 1;
          continue;
        }
        if (!l.trim()) {
          // A blank line keeps the list open only if the next line belongs to it
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j += 1;
          const next = lines[j];
          if (next !== undefined && (indentOf(next) > base + 1 || (pattern.test(next) && indentOf(next) <= base + 1))) {
            current.push('');
            i += 1;
            continue;
          }
          break;
        }
        if (indentOf(l) > base + 1) {
          current.push(dedent(l, contentIndent));
          i += 1;
          continue;
        }
        if (!isBlockStart(l)) {
          current.push(l.trim());
          i += 1;
          continue;
        }
        break;
      }

      blocks.push({
        type: 'list',
        ordered,
        start: ordered ? Number(listMatch[2]) : 1,
        items: items.map((item) => parseBlocks(item)),
      });
      continue;
    }

    // Paragraph: consecutive lines until a blank line or another block
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: para.join('\n') });
  }

  return blocks;
};

export const parseMarkdown = (source: string): Block[] =>
  parseBlocks(source.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n'));

// ── URL safety ───────────────────────────────────────────────────────────

/** http(s), mailto, or a site-relative path ("/cv", "/#contact"). Rejects "//host" and "/\host". */
export const safeHref = (url: string): string | null => {
  const u = url.trim();
  if (/^https?:\/\/[^\s/\\]+[^\s\\]*$/i.test(u)) return u;
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(u)) return u;
  if (/^\/(?![/\\])[^\s\\]*$/.test(u)) return u;
  return null;
};

/** Site-relative image only, common web formats. */
export const safeImageSrc = (src: string): string | null => {
  const s = src.trim();
  return /^\/(?![/\\])[^\s\\"'()]+\.(?:avif|webp|png|jpe?g|gif|svg)(?:\?[^\s"'()]*)?$/i.test(s) ? s : null;
};

// ── Inline rendering ─────────────────────────────────────────────────────

interface Ctx {
  lang: Lang;
}

const PUNCT = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
const WORD = /[\p{L}\p{N}]/u;

/** Index of the "]" closing the "[" at `open`, or -1. */
const closingBracket = (text: string, open: number) => {
  let depth = 0;
  for (let k = open; k < text.length; k += 1) {
    const c = text[k];
    if (c === '\\') {
      k += 1;
      continue;
    }
    if (c === '[') depth += 1;
    else if (c === ']') {
      depth -= 1;
      if (depth === 0) return k;
    }
  }
  return -1;
};

/** Index of the ")" closing the "(" at `open` (balanced), or -1. */
const closingParen = (text: string, open: number) => {
  let depth = 0;
  for (let k = open; k < text.length; k += 1) {
    const c = text[k];
    if (c === '\\') {
      k += 1;
      continue;
    }
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) return k;
    }
  }
  return -1;
};

/** Destination of a link or image: url, optional =WxH, optional "title". */
const parseDestination = (raw: string) => {
  const m = raw.trim().match(/^<?([^\s>]*)>?(?:\s+=(\d{1,5})x(\d{1,5}))?(?:\s+(?:"([^"]*)"|'([^']*)'))?\s*$/);
  if (!m) return null;
  return {
    url: m[1],
    width: m[2] ? Number(m[2]) : undefined,
    height: m[3] ? Number(m[3]) : undefined,
    title: m[4] ?? m[5],
  };
};

/** Find the closing delimiter for emphasis, skipping escaped chars and code spans. */
const findCloser = (text: string, from: number, delim: string) => {
  for (let k = from; k < text.length; k += 1) {
    const c = text[k];
    if (c === '\\') {
      k += 1;
      continue;
    }
    if (c === '`') {
      const run = text.slice(k).match(/^`+/)![0];
      const end = text.indexOf(run, k + run.length);
      if (end > 0) k = end + run.length - 1;
      continue;
    }
    if (text.startsWith(delim, k)) {
      // Single * must not match half of a ** pair
      if (delim.length === 1 && text[k + 1] === delim) {
        k += 1;
        continue;
      }
      if (/\s/.test(text[k - 1] ?? ' ')) continue;
      // "_" only closes at a word boundary (snake_case stays intact)
      if (delim[0] === '_' && WORD.test(text[k + delim.length] ?? '')) continue;
      return k;
    }
  }
  return -1;
};

const linkClass =
  'link-static text-ink transition-colors duration-300 hover:text-accent-ink focus-visible:text-accent-ink';

const renderLink = (href: string, children: ReactNode, key: string) => {
  // Already localised paths ("/en/...") stay as written
  const raw = /^\/en(\/|$|#)/.test(href);
  return (
    <SmartLink key={key} to={href} raw={raw} className={linkClass}>
      {children}
    </SmartLink>
  );
};

const renderImage = (alt: string, dest: NonNullable<ReturnType<typeof parseDestination>>, key: string, block = false) => {
  const src = safeImageSrc(dest.url);
  if (!src) return alt ? <span key={key}>{alt}</span> : null;
  return (
    <img
      key={key}
      src={src}
      alt={alt}
      title={block ? undefined : dest.title}
      width={dest.width}
      height={dest.height}
      loading="lazy"
      decoding="async"
      className={cn('h-auto max-w-full bg-bg-2', block ? 'w-full' : 'inline-block align-middle')}
    />
  );
};

const renderInline = (text: string, ctx: Ctx, prefix = 'i'): ReactNode[] => {
  const out: ReactNode[] = [];
  let buffer = '';
  let n = 0;
  const key = () => `${prefix}-${n++}`;
  const flush = () => {
    if (buffer) out.push(typo(buffer, ctx.lang));
    buffer = '';
  };

  let i = 0;
  while (i < text.length) {
    const c = text[i];

    // Backslash: escape, or hard line break before a newline
    if (c === '\\') {
      const next = text[i + 1];
      if (next === '\n') {
        flush();
        out.push(<br key={key()} />);
        i += 2;
        continue;
      }
      if (next && PUNCT.test(next)) {
        buffer += next;
        i += 2;
        continue;
      }
    }

    // Line breaks: two trailing spaces = <br>, otherwise a space
    if (c === '\n') {
      if (/ {2,}$/.test(buffer)) {
        buffer = buffer.replace(/ +$/, '');
        flush();
        out.push(<br key={key()} />);
      } else {
        buffer = `${buffer.replace(/ +$/, '')} `;
      }
      i += 1;
      while (text[i] === ' ') i += 1;
      continue;
    }

    // Inline code
    if (c === '`') {
      const run = text.slice(i).match(/^`+/)![0];
      const end = text.indexOf(run, i + run.length);
      if (end > 0 && text[end + run.length] !== '`') {
        flush();
        const code = text.slice(i + run.length, end).replace(/\n/g, ' ');
        const trimmed = /^ .* $/.test(code) && code.trim() ? code.slice(1, -1) : code;
        out.push(
          <code key={key()} className="border border-line bg-bg-2 px-[0.35em] py-[0.1em] font-mono text-[0.86em] text-ink">
            {trimmed}
          </code>,
        );
        i = end + run.length;
        continue;
      }
      buffer += run;
      i += run.length;
      continue;
    }

    // Image ![alt](src)
    if (c === '!' && text[i + 1] === '[') {
      const close = closingBracket(text, i + 1);
      if (close > 0 && text[close + 1] === '(') {
        const end = closingParen(text, close + 1);
        const dest = end > 0 ? parseDestination(text.slice(close + 2, end)) : null;
        if (dest) {
          flush();
          const img = renderImage(text.slice(i + 2, close), dest, key());
          if (img) out.push(img);
          i = end + 1;
          continue;
        }
      }
    }

    // Link [label](href)
    if (c === '[') {
      const close = closingBracket(text, i);
      if (close > 0 && text[close + 1] === '(') {
        const end = closingParen(text, close + 1);
        const dest = end > 0 ? parseDestination(text.slice(close + 2, end)) : null;
        if (dest) {
          flush();
          const k = key();
          const label = renderInline(text.slice(i + 1, close), ctx, k);
          const href = safeHref(dest.url);
          out.push(href ? renderLink(href, label, k) : <span key={k}>{label}</span>);
          i = end + 1;
          continue;
        }
      }
    }

    // Autolink <https://…> / <mailto:…>
    if (c === '<') {
      const m = text.slice(i).match(/^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i);
      if (m) {
        const href = safeHref(m[1]);
        flush();
        const k = key();
        const label = m[1].replace(/^mailto:/i, '');
        out.push(href ? renderLink(href, label, k) : <span key={k}>{label}</span>);
        i += m[0].length;
        continue;
      }
    }

    // Strong **x** / __x__
    if ((c === '*' || c === '_') && text[i + 1] === c && text[i + 2] && !/\s/.test(text[i + 2])) {
      const delim = c + c;
      const leftOk = c === '*' || !WORD.test(text[i - 1] ?? '');
      const end = leftOk ? findCloser(text, i + 2, delim) : -1;
      if (end > 0) {
        flush();
        const k = key();
        out.push(
          <strong key={k} className="font-semibold text-ink">
            {renderInline(text.slice(i + 2, end), ctx, k)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }

    // Emphasis *x* / _x_
    if ((c === '*' || c === '_') && text[i + 1] && !/\s/.test(text[i + 1]) && text[i + 1] !== c) {
      const leftOk = c === '*' || !WORD.test(text[i - 1] ?? '');
      const end = leftOk ? findCloser(text, i + 1, c) : -1;
      if (end > 0) {
        flush();
        const k = key();
        out.push(<em key={k}>{renderInline(text.slice(i + 1, end), ctx, k)}</em>);
        i = end + 1;
        continue;
      }
    }

    buffer += c;
    i += 1;
  }
  flush();
  return out;
};

// ── Block rendering ──────────────────────────────────────────────────────

const IMAGE_ONLY = /^!\[([^\]]*)\]\(([^)]*)\)$/;

const renderBlocks = (blocks: Block[], ctx: Ctx, prefix = 'b'): ReactNode[] =>
  blocks.map((block, index) => {
    const key = `${prefix}-${index}`;
    switch (block.type) {
      case 'heading':
        return block.level === 2 ? (
          <h2
            key={key}
            className="mt-16 font-semiwide text-[clamp(1.5rem,2.3vw,2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink first:mt-0"
          >
            {renderInline(block.text, ctx, key)}
          </h2>
        ) : (
          <h3 key={key} className="mt-12 font-semiwide text-[1.3rem] font-semibold leading-[1.2] tracking-[-0.012em] text-ink first:mt-0">
            {renderInline(block.text, ctx, key)}
          </h3>
        );

      case 'paragraph': {
        const img = block.text.trim().match(IMAGE_ONLY);
        const dest = img ? parseDestination(img[2]) : null;
        if (img && dest) {
          const image = renderImage(img[1], dest, `${key}-img`, true);
          if (!image) return null;
          return (
            <figure key={key} className="my-12 first:mt-0">
              {image}
              {dest.title && <figcaption className="label mt-3 normal-case tracking-normal">{typo(dest.title, ctx.lang)}</figcaption>}
            </figure>
          );
        }
        return (
          <p key={key} className="mt-6 first:mt-0">
            {renderInline(block.text, ctx, key)}
          </p>
        );
      }

      case 'code':
        return (
          <figure key={key} className="mt-8 border border-line bg-bg-2 first:mt-0">
            {block.info && (
              <figcaption className="label border-b border-line px-5 py-2.5">{block.info}</figcaption>
            )}
            <pre tabIndex={0} className="overflow-x-auto px-5 py-4 font-mono text-[0.84rem] leading-[1.7] text-ink">
              <code>{block.code}</code>
            </pre>
          </figure>
        );

      case 'list': {
        const items = block.items.map((item, k) => {
          const tight = item.length === 1 && item[0].type === 'paragraph';
          return (
            <li key={`${key}-${k}`} className="pl-1.5">
              {tight && item[0].type === 'paragraph'
                ? renderInline(item[0].text, ctx, `${key}-${k}`)
                : renderBlocks(item, ctx, `${key}-${k}`)}
            </li>
          );
        });
        return block.ordered ? (
          <ol
            key={key}
            start={block.start !== 1 ? block.start : undefined}
            className="mt-6 list-decimal space-y-2.5 pl-7 marker:font-mono marker:text-[0.82em] marker:text-ink-3 first:mt-0 [li>&]:mt-2.5"
          >
            {items}
          </ol>
        ) : (
          <ul key={key} className="mt-6 list-[square] space-y-2.5 pl-6 marker:text-accent first:mt-0 [li>&]:mt-2.5">
            {items}
          </ul>
        );
      }

      case 'quote':
        return (
          <blockquote
            key={key}
            className="my-10 border-l-2 border-accent pl-6 font-semiwide text-[1.25rem] leading-[1.5] tracking-[-0.01em] text-ink first:mt-0 md:pl-8"
          >
            {renderBlocks(block.blocks, ctx, key)}
          </blockquote>
        );

      case 'hr':
        return <hr key={key} className="my-14 border-0 border-t border-line" />;

      default:
        return null;
    }
  });

// ── Component ────────────────────────────────────────────────────────────

interface MarkdownProps {
  source: string;
  /** Language of the text (typography rules, e.g. French spacing). */
  lang: Lang;
  className?: string;
}

/** Reading measure ~65ch, 1.125rem, generous leading. */
export const Markdown = ({ source, lang, className }: MarkdownProps) => {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <div className={cn('min-w-0 max-w-[65ch] text-[1.125rem] leading-[1.75] text-ink-2', className)}>
      {renderBlocks(blocks, { lang })}
    </div>
  );
};
