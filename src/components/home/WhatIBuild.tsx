import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { capabilities, resolveEntities } from '../../data';
import { useRevealChildren } from '../../hooks';
import { useL, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { SectionHeader } from '../ui/SectionHeader';
import { SmartLink } from '../ui/SmartLink';
import { CropMarks } from './identity/CropMarks';
import { Glyph } from './identity/Glyph';
import { useEntityLabel } from './identity/EvidenceLinks';

/**
 * Hairlines between the cells: one column on phones, 2 × 2 on tablets,
 * 4 columns on desktop. Rows are CSS subgrids from md up, so titles, scopes
 * and proofs line up across columns like a spec sheet.
 */
const cellBorders = (i: number) =>
  cn(
    'border-line',
    i > 0 && 'border-t',
    i % 2 === 1 ? 'md:border-l' : 'md:border-l-0',
    i >= 2 ? 'md:border-t' : 'md:border-t-0',
    i > 0 ? 'lg:border-l' : 'lg:border-l-0',
    'lg:border-t-0',
  );

/** 03 · What I build: four capabilities, each tied to real projects. */
export default function WhatIBuild() {
  const l = useL();
  const t = useT('home');
  const tc = useT('common');
  const entityLabel = useEntityLabel();
  const listRef = useRevealChildren<HTMLOListElement>();
  const pad = 'px-5 sm:px-6 xl:px-8';

  return (
    <section id="build" aria-labelledby="build-title" className="py-section">
      <div className="container-site">
        <SectionHeader
          id="build"
          label={t.buildLabel}
          title={<span id="build-title">{t.buildTitle}</span>}
          intro={<p>{t.buildIntro}</p>}
        />

        <ol
          ref={listRef}
          className="grid grid-cols-1 border-y border-line md:grid-cols-2 md:grid-rows-[repeat(8,auto)] lg:grid-cols-4 lg:grid-rows-[repeat(4,auto)]"
        >
          {capabilities.map((c, i) => (
            <li
              key={c.id}
              className={cn(
                'reveal group relative grid md:row-span-4 md:grid-rows-subgrid',
                cellBorders(i),
              )}
              style={{ '--reveal-delay': `${i * 90}ms` } as CSSProperties}
            >
              {/* Accent marker along the top rule */}
              <span
                aria-hidden="true"
                className="absolute -top-px left-0 z-10 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out-expo group-focus-within:scale-x-100 group-hover:scale-x-100"
              />

              {/* 1 · index + glyph */}
              <div className={cn('flex items-start justify-between gap-6 pt-6 md:block md:pt-7', pad)}>
                <span aria-hidden="true" className="label tabular text-accent-ink">{pad2(i + 1)}</span>
                <div className="relative mr-2 mt-1 w-[8.5rem] shrink-0 sm:w-40 md:mt-10">
                  <Glyph name={c.glyph} className="w-full" />
                  <CropMarks className="-inset-3 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100" />
                </div>
              </div>

              {/* 2 · title + body */}
              <div className={cn('pb-7 pt-4 md:pb-8 md:pt-10', pad)}>
                <h3 className="font-semiwide text-display-s font-semibold text-ink">{l(c.title)}</h3>
                <p className="mt-3 max-w-[32ch] text-ink-2">{l(c.body)}</p>
              </div>

              {/* 3 · scope */}
              <div className={cn('border-t border-line py-5', pad)}>
                <p className="label">{t.buildScope}</p>
                <ul className="mt-3 space-y-1.5 font-mono text-[0.8125rem] leading-snug text-ink">
                  {c.items.map((item, k) => (
                    <li key={k} className="flex gap-3">
                      <span aria-hidden="true" className="tabular text-ink-3">
                        {String.fromCharCode(97 + k)}
                      </span>
                      <span>{l(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4 · proof */}
              <div className={cn('border-t border-line pb-6 pt-5 md:pb-8', pad)}>
                <p className="label">{tc.proof}</p>
                <ul className="mt-2">
                  {resolveEntities(c.evidence).map((e) => (
                    <li key={e.id}>
                      <SmartLink
                        to={e.href ?? '/'}
                        className="group/p flex min-h-11 items-center justify-between gap-3 text-[0.9375rem] text-ink-2 transition-colors duration-300 hover:text-ink focus-visible:text-ink md:min-h-9"
                      >
                        <span className="link">{entityLabel(e)}</span>
                        <ArrowRight
                          aria-hidden="true"
                          size={15}
                          strokeWidth={1.6}
                          className="shrink-0 text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover/p:translate-x-1 group-hover/p:text-accent-ink group-focus-visible/p:translate-x-1"
                        />
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
