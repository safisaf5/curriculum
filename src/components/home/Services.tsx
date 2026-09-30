import { Fragment, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { services, type Service } from '../../data';
import { useMediaQuery } from '../../hooks';
import { useL, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { ServicePanel } from '../offer/ServicePanel';
import { SectionHeader } from '../ui/SectionHeader';

/**
 * Services: one set of panels, two ways in.
 *  - Desktop (lg+): a sticky vertical tablist on the left (ARIA tabs, roving
 *    tabindex, arrow keys with automatic activation), the selected panel on
 *    the right.
 *  - Mobile / tablet: an accordion (button in an h3, aria-expanded), several
 *    items can be open, the first one is open by default.
 * The panels are shared: inactive ones keep the `hidden` attribute, so all the
 * content is in the prerendered HTML. The server renders the accordion state
 * (first service open), which is also the desktop start state: no flicker.
 */

const panelId = (id: string) => `service-${id}-panel`;
const tabId = (id: string) => `service-${id}-tab`;
const headerId = (id: string) => `service-${id}-header`;

/** Index + title + short line, shared by the desktop tab and the mobile accordion header. */
const Heading = ({ service: s, on, emphasis, trailing }: { service: Service; on: boolean; emphasis: boolean; trailing: ReactNode }) => {
  const l = useL();
  return (
    <>
      <span
        className={cn(
          'tabular font-wide text-[2rem] font-extrabold leading-[0.85] tracking-[-0.05em] transition-colors duration-500 sm:text-[2.75rem] lg:text-[3.25rem]',
          on ? 'text-accent' : 'text-ink-3 group-hover:text-ink',
        )}
      >
        {s.index}
      </span>
      <span
        className={cn(
          'min-w-0 transition-transform duration-500 ease-out-expo',
          emphasis && (on ? 'translate-x-2' : 'group-hover:translate-x-2'),
        )}
      >
        <span
          className={cn(
            'block font-semiwide text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.02em] transition-colors duration-300 sm:text-display-s',
            on || !emphasis ? 'text-ink' : 'text-ink-2 group-hover:text-ink',
          )}
        >
          {l(s.title)}
        </span>
        <span className="mt-2.5 block max-w-[46ch] text-[0.95rem] font-normal leading-snug text-ink-2">{l(s.short)}</span>
      </span>
      {trailing}
    </>
  );
};

/** Accent rule drawn over the top hairline of the selected / open service. */
const Rule = ({ on }: { on: boolean }) => (
  <span
    aria-hidden="true"
    className={cn(
      'absolute inset-x-0 -top-px h-px origin-left bg-accent transition-transform duration-700 ease-out-expo',
      on ? 'scale-x-100' : 'scale-x-0',
    )}
  />
);

const PlusMinus = ({ open }: { open: boolean }) => (
  <span aria-hidden="true" className="relative mt-2 flex h-5 w-5 shrink-0 items-center justify-center">
    <span className="absolute h-[1.5px] w-4 bg-ink" />
    <span
      className={cn(
        'absolute h-4 w-[1.5px] bg-ink transition-transform duration-500 ease-out-expo',
        open ? 'rotate-90 scale-y-0' : 'rotate-0',
      )}
    />
  </span>
);

const ROW =
  'group relative grid w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-x-4 py-6 text-left sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:gap-x-5';

export default function Services() {
  const t = useT('offer');
  const l = useL();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const first = services[0]?.id ?? '';
  const [active, setActive] = useState(first);
  const [open, setOpen] = useState<string[]>(first ? [first] : []);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const headers = useRef<(HTMLButtonElement | null)[]>([]);

  const selectTab = (id: string) => {
    if (id === active) return;
    setActive(id);
    // The tablist is sticky: if the visitor is deep inside a long panel, bring the new one's top into view
    // (scroll-padding-top on <html> keeps it clear of the nav).
    const grid = gridRef.current;
    if (grid && grid.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      grid.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const toggle = (id: string) => {
    setOpen((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const nextIndex = (key: string, i: number) => {
    const n = services.length;
    if (key === 'ArrowDown' || key === 'ArrowRight') return (i + 1) % n;
    if (key === 'ArrowUp' || key === 'ArrowLeft') return (i - 1 + n) % n;
    if (key === 'Home') return 0;
    if (key === 'End') return n - 1;
    return -1;
  };

  // Tabs: arrows move focus and select (automatic activation).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = nextIndex(e.key, i);
    if (next < 0) return;
    e.preventDefault();
    tabs.current[next]?.focus();
    selectTab(services[next].id);
  };

  // Accordion: arrows only move focus between headers.
  const onHeaderKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return;
    const next = nextIndex(e.key, i);
    if (next < 0) return;
    e.preventDefault();
    headers.current[next]?.focus();
  };

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-section">
      <div className="container-site">
        <SectionHeader
          id="services"
          label={t.servicesLabel}
          title={<span id="services-title">{l(t.servicesTitle)}</span>}
          intro={<p>{l(t.servicesIntro)}</p>}
        />

        <div ref={gridRef} className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
          {/* Desktop: sticky vertical tablist */}
          <div className="hidden lg:col-span-5 lg:block">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label={t.servicesListLabel}
              className="sticky top-[calc(var(--nav-h)+1.5rem)] border-b border-line"
            >
              {services.map((s, i) => {
                const on = active === s.id;
                return (
                  <button
                    key={s.id}
                    ref={(el) => (tabs.current[i] = el)}
                    type="button"
                    role="tab"
                    id={tabId(s.id)}
                    aria-selected={on}
                    aria-controls={panelId(s.id)}
                    tabIndex={on ? 0 : -1}
                    onClick={() => selectTab(s.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(ROW, 'border-t border-line lg:py-8', on ? 'cursor-default' : 'cursor-pointer')}
                  >
                    <Rule on={on} />
                    <Heading
                      service={s}
                      on={on}
                      emphasis
                      trailing={
                        <ArrowRight
                          aria-hidden="true"
                          size={18}
                          strokeWidth={1.6}
                          className={cn(
                            'mt-2 shrink-0 transition-[transform,color] duration-500 ease-out-expo',
                            on ? 'translate-x-1 text-accent-ink' : 'text-ink-3 group-hover:translate-x-1 group-hover:text-ink',
                          )}
                        />
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panels, preceded by their accordion header below lg */}
          <div className="border-b border-line lg:col-span-7 lg:border-b-0 xl:col-span-6 xl:col-start-7">
            {services.map((s, i) => {
              const expanded = open.includes(s.id);
              const visible = desktop ? active === s.id : expanded;
              return (
                <Fragment key={s.id}>
                  <h3 className="relative border-t border-line lg:hidden">
                    <Rule on={expanded} />
                    <button
                      ref={(el) => (headers.current[i] = el)}
                      type="button"
                      id={headerId(s.id)}
                      aria-expanded={expanded}
                      aria-controls={panelId(s.id)}
                      onClick={() => toggle(s.id)}
                      onKeyDown={(e) => onHeaderKey(e, i)}
                      className={ROW}
                    >
                      <Heading service={s} on={expanded} emphasis={false} trailing={<PlusMinus open={expanded} />} />
                    </button>
                  </h3>
                  <div
                    id={panelId(s.id)}
                    role={desktop ? 'tabpanel' : 'region'}
                    aria-labelledby={desktop ? tabId(s.id) : headerId(s.id)}
                    hidden={!visible}
                  >
                    <ServicePanel service={s} total={services.length} />
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
