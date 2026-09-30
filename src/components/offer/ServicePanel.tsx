import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { resolveEntities, type EntityKind, type L, type Service } from '../../data';
import { useL, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { requestContact } from '../../lib/contactIntent';
import { pad2 } from '../../lib/text';
import { ButtonLink } from '../ui/Button';
import { SmartLink } from '../ui/SmartLink';

type OfferStrings = ReturnType<typeof useT<'offer'>>;

const kindLabel = (kind: EntityKind, t: OfferStrings) =>
  ({
    project: t.kindProject,
    experience: t.kindExperience,
    education: t.kindEducation,
    media: t.kindMedia,
    award: t.kindAward,
    engagement: t.kindEngagement,
    certificate: t.kindCertificate,
  })[kind];

/** Numbered spec list: "01  Audit des processus automatisables". */
const SpecList = ({ title, items }: { title: string; items: L[] }) => {
  const l = useL();
  return (
    <div>
      <h4 className="label mb-4 flex items-baseline justify-between gap-3">
        <span>{title}</span>
        <span aria-hidden="true" className="tabular text-ink-3/70">{pad2(items.length)}</span>
      </h4>
      <ol className="border-t border-line">
        {items.map((item, i) => (
          <li
            key={i}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline border-b border-line py-3 text-[0.95rem] leading-snug text-ink-2"
          >
            <span aria-hidden="true" className="tabular font-mono text-[0.6875rem] font-medium tracking-[0.04em] text-ink-3">
              {pad2(i + 1)}
            </span>
            <span>{l(item)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

interface ServicePanelProps {
  service: Service;
  total: number;
  /** Short fade / rise when the panel appears after a click. */
  animate?: boolean;
}

/** Detail of one service: statement, examples, deliverables, proof, call to action. */
export const ServicePanel = ({ service: s, total, animate }: ServicePanelProps) => {
  const l = useL();
  const t = useT('offer');
  const related = resolveEntities(s.related);

  return (
    <div
      className={cn(
        'pb-12 sm:pl-[calc(4.75rem+1.25rem)] lg:border-t lg:border-line lg:pb-0 lg:pl-0 lg:pt-8',
        animate && 'animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]',
      )}
    >
      {/* Desktop heading of the panel (below lg the accordion header is the h3) */}
      <h3 className="label mb-8 hidden items-center gap-3 lg:flex">
        <span aria-hidden="true" className="tabular text-accent-ink">{s.index}</span>
        <span aria-hidden="true" className="tabular">/ {pad2(total)}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="truncate text-ink-2">{l(s.title)}</span>
      </h3>

      <p className="max-w-[34ch] font-semiwide text-[1.2rem] font-medium leading-[1.3] tracking-[-0.012em] text-ink sm:text-[1.35rem] lg:text-[clamp(1.35rem,1.75vw,1.75rem)]">
        {l(s.description)}
      </p>

      <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:mt-12 xl:gap-10">
        <SpecList title={t.servicesExamples} items={s.examples} />
        <SpecList title={t.servicesDeliverables} items={s.deliverables} />
      </div>

      {related.length > 0 && (
        <div className="mt-10 lg:mt-12">
          <h4 className="label mb-4">{t.servicesRelated}</h4>
          <ul className="border-t border-line">
            {related.map((e) => {
              const Arrow = e.external ? ArrowUpRight : ArrowRight;
              return (
                <li key={e.id} className="border-b border-line">
                  <SmartLink
                    to={e.href ?? '/'}
                    className="group grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
                  >
                    <span className="label hidden sm:block">{kindLabel(e.kind, t)}</span>
                    <span className="min-w-0">
                      <span className="link text-[0.975rem] font-medium text-ink group-hover:[background-size:100%_1px]">
                        {l(e.title)}
                      </span>
                      {e.subtitle && (
                        <span className="mt-0.5 block text-[0.875rem] text-ink-3">
                          <span className="sm:hidden">{kindLabel(e.kind, t)} · </span>
                          {l(e.subtitle)}
                        </span>
                      )}
                    </span>
                    <Arrow
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.6}
                      className="text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent-ink"
                    />
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-10 lg:mt-12">
        <ButtonLink
          to="/#contact"
          className="w-full sm:w-auto"
          onClick={() => {
            // SmartLink scrolls to #contact and moves focus there; we only pre-select the subject.
            requestContact(s.subject, false);
            track('service_cta', { service: s.id });
          }}
        >
          {t.servicesCta}
        </ButtonLink>
      </div>
    </div>
  );
};
