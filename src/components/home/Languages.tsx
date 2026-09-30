import { languages } from '../../data';
import { useReveal, useRevealChildren } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { formatYearMonth } from '../../lib/dates';
import { dotJoin, pad2 } from '../../lib/text';
import { SectionHeader } from '../ui/SectionHeader';
import { CefrBar, CefrScaleHeader, useCefrText } from '../skills/CefrBar';

const certified = languages.filter((x) => x.certification).length;

const Legend = () => {
  const t = useT('skills');
  const swatch = 'h-1.5 w-5 shrink-0';
  return (
    <div>
      <p className="label">{t.cefrScale}</p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 text-[0.875rem] text-ink-2">
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`${swatch} bg-ink`} />
          {t.cefrLegendReached}
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`${swatch} bg-accent`} />
          {t.cefrLegendTop}
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`${swatch} bg-line`} />
          {t.cefrLegendAhead}
        </li>
      </ul>
    </div>
  );
};

export default function Languages() {
  const { l, lang } = useI18n();
  const t = useT('skills');
  const levelText = useCefrText();
  const lineRef = useReveal<HTMLDivElement>();
  const listRef = useRevealChildren<HTMLOListElement>();
  const asideRef = useReveal<HTMLDivElement>();

  return (
    <section id="languages" aria-labelledby="languages-title" className="py-section">
      <div className="container-site grid gap-y-4 lg:grid-cols-12 lg:gap-x-10">
        {/* Title and key, pinned while the rows scroll by */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <SectionHeader
              id="languages"
              label={t.languagesLabel}
              title={<span id="languages-title">{t.languagesTitle}</span>}
              layout="stack"
              className="mb-10 md:mb-14"
              titleClassName="lg:max-w-[14ch] lg:!text-display-m"
            />
            <div ref={asideRef} className="reveal grid gap-10 pb-6 md:grid-cols-2 lg:grid-cols-1">
              <dl className="grid max-w-md grid-cols-2 gap-x-8">
                <div className="flex flex-col-reverse justify-end border-t border-line pt-3">
                  <dt className="label mt-2">{t.languagesSpoken}</dt>
                  <dd className="font-semiwide text-display-s font-semibold tabular text-ink">{pad2(languages.length)}</dd>
                </div>
                <div className="flex flex-col-reverse justify-end border-t border-line pt-3">
                  <dt className="label mt-2">{t.languagesCertified}</dt>
                  <dd className="font-semiwide text-display-s font-semibold tabular text-ink">{pad2(certified)}</dd>
                </div>
              </dl>
              <Legend />
            </div>
          </div>
        </div>

        {/* One row per language */}
        <div className="lg:col-span-7">
          <div ref={lineRef} className="reveal-line hidden h-px w-full bg-line lg:block" aria-hidden="true" />
          <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 pb-3 pt-4 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-8 lg:pt-[1.15rem]">
            <span aria-hidden="true" className="label self-end pb-px">ISO</span>
            <CefrScaleHeader />
          </div>
          <ol ref={listRef}>
            {languages.map((x, i) => {
              const cert = x.certification;
              return (
                <li
                  key={x.code}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 border-t border-line py-7 last:border-b md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-8 md:py-9"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center border border-ink font-mono text-[0.8125rem] font-medium tracking-[0.06em] text-ink md:h-14 md:w-14"
                  >
                    {x.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-semiwide text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-ink md:text-[1.85rem]">
                        {l(x.name)}
                      </h3>
                      <p className="font-mono text-[0.8125rem] font-medium uppercase tracking-[0.06em] tabular text-ink">
                        {levelText(x)}
                      </p>
                    </div>
                    <p className="mt-2 text-ink-2">{l(x.level)}</p>
                    <CefrBar language={x} delay={i * 90} className="mt-5" />
                    {(cert || x.note) && (
                      <div className="mt-5 space-y-1.5 text-[0.9375rem] leading-snug">
                        {cert && (
                          <p className="flex items-baseline gap-3">
                            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] bg-accent" />
                            <span>
                              <span className="sr-only">{l(t.languagesCertificate)} </span>
                              <span className="font-medium text-ink">{cert.name}</span>
                              <span className="text-ink-2">
                                {' · '}
                                {dotJoin(l(cert.detail), formatYearMonth(cert.date, lang))}
                              </span>
                            </span>
                          </p>
                        )}
                        {x.note && <p className={cert ? 'pl-[1.125rem] text-ink-3' : 'text-ink-3'}>{l(x.note)}</p>}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
