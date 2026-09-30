import type { CSSProperties } from 'react';
import { stats } from '../../data';
import { useRevealChildren } from '../../hooks';
import { useT } from '../../i18n';
import { pad2 } from '../../lib/text';
import { CountUp } from './identity/CountUp';

interface Figure {
  id: string;
  value: number;
  label: string;
  /** A year is a date, not a quantity: it never counts. */
  year?: boolean;
  approx?: boolean;
}

/**
 * Numbers band between Identity and "What I build". Every figure is derived
 * from /src/data (see src/data/stats.ts), never typed by hand.
 */
export default function Proof() {
  const t = useT('home');
  const gridRef = useRevealChildren<HTMLDListElement>();

  const figures: Figure[] = [
    { id: 'since', value: stats.since, label: t.proofSince, year: true },
    { id: 'companies', value: stats.companies, label: t.proofCompanies },
    { id: 'brand', value: stats.brandsAcquired, label: t.proofBrand },
    { id: 'experiences', value: stats.experiences, label: t.proofExperiences(stats.sectors) },
    { id: 'languages', value: stats.languages, label: t.proofLanguages },
    { id: 'workshop', value: stats.workshopParticipants, label: t.proofWorkshop, approx: true },
  ];

  return (
    <section aria-labelledby="proof-title" className="pb-8 md:pb-12">
      <div className="container-site">
        <h2 id="proof-title" className="label flex items-center gap-3 pb-5">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
          {t.proofLabel}
        </h2>

        <dl ref={gridRef} className="grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-3 xl:grid-cols-6">
          {figures.map((f, i) => (
            <div
              key={f.id}
              className="flex flex-col bg-bg px-4 pb-6 pt-5 sm:px-5 md:px-6 md:pb-8 md:pt-6"
              style={{ '--reveal-delay': `${i * 70}ms` } as CSSProperties}
            >
              <dt className="reveal order-2 mt-5 max-w-[24ch] text-[0.9375rem] leading-snug text-ink-2 md:mt-6">
                {f.label}
              </dt>
              <dd className="reveal order-1">
                <span aria-hidden="true" className="label tabular block text-accent-ink">
                  {pad2(i + 1)}
                </span>
                <span className="mt-10 flex items-baseline font-wide text-[clamp(2.4rem,11.8vw,3.4rem)] font-extrabold leading-[0.82] tracking-[-0.05em] text-ink md:mt-14 md:text-[clamp(3.4rem,8.2vw,5.6rem)] xl:text-[clamp(3.2rem,4.1vw,4.2rem)]">
                  {f.approx && (
                    <span aria-hidden="true" className="mr-[0.06em] text-[0.6em] font-semibold text-ink-3">
                      ≈
                    </span>
                  )}
                  <CountUp value={f.value} animate={!f.year} className="tabular" />
                  <span className="sr-only">{f.approx ? t.proofAbout(f.value) : f.value}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-[0.8125rem] text-ink-3 md:text-right">{t.proofNote}</p>
      </div>
    </section>
  );
}
