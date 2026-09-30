import { ArrowUpRight } from 'lucide-react';
import { media, type MediaItem, type MediaType } from '../../data';
import { useI18n, useL, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { formatYearMonth } from '../../lib/dates';
import { MediaMarker } from '../offer/MediaMarker';
import { ScreenPlate } from '../offer/ScreenPlate';
import { SectionHeader } from '../ui/SectionHeader';
import { SmartLink } from '../ui/SmartLink';

/**
 * Speaking & media: a timeline-gallery, fully data driven.
 * To add an appearance, add an entry to `media` in src/data/recognition.ts:
 * it is sorted, grouped by year and drawn (screen plate for tv / video,
 * typographic marker otherwise) without touching this file.
 */

/** Newest first. Year-only dates ('2024') keep the order of the data file within their year. */
const sorted = media
  .map((item, i) => ({ item, i }))
  .sort((a, b) => {
    const ya = a.item.date.slice(0, 4);
    const yb = b.item.date.slice(0, 4);
    if (ya !== yb) return yb.localeCompare(ya);
    const ma = a.item.date.slice(5, 7);
    const mb = b.item.date.slice(5, 7);
    if (ma && mb && ma !== mb) return mb.localeCompare(ma);
    return a.i - b.i;
  })
  .map(({ item }) => item);

const groups = sorted.reduce<{ year: string; items: MediaItem[] }[]>((acc, item) => {
  const year = item.date.slice(0, 4);
  const last = acc[acc.length - 1];
  if (last?.year === year) last.items.push(item);
  else acc.push({ year, items: [item] });
  return acc;
}, []);

const isScreen = (type: MediaType): type is 'tv' | 'video' => type === 'tv' || type === 'video';

const MediaRow = ({ item: m }: { item: MediaItem }) => {
  const { l, lang } = useI18n();
  const t = useT('offer');
  const typeLabel = {
    tv: t.mediaTypeTv,
    video: t.mediaTypeVideo,
    stage: t.mediaTypeStage,
    workshop: t.mediaTypeWorkshop,
    article: t.mediaTypeArticle,
    civic: t.mediaTypeCivic,
  }[m.type];
  const date = formatYearMonth(m.date, lang);
  const onOpen = () => track('media_open', { id: m.id });

  const visual = isScreen(m.type) ? (
    m.url ? (
      // Mouse shortcut to the same URL as the text link below: kept out of the tab order and the a11y tree.
      <SmartLink to={m.url} tabIndex={-1} aria-hidden="true" onClick={onOpen} className="group/plate block">
        <ScreenPlate kind={m.type} outlet={l(m.outlet)} typeLabel={typeLabel} linked />
      </SmartLink>
    ) : (
      <ScreenPlate kind={m.type} outlet={l(m.outlet)} typeLabel={typeLabel} linked={false} />
    )
  ) : (
    <MediaMarker type={m.type as Exclude<MediaType, 'tv' | 'video'>} seed={m.id} lang={lang} />
  );

  return (
    <li className="group/row grid gap-x-8 gap-y-5 border-t border-line py-8 md:grid-cols-10 md:py-10 md:first:border-t-0 xl:gap-x-10">
      <p className="label flex items-center gap-3 md:col-span-6 xl:col-span-2 xl:flex-col xl:items-start xl:gap-2.5 xl:pt-2">
        <time dateTime={m.date} className="tabular text-ink-2">
          {date}
        </time>
        <span aria-hidden="true" className="h-px w-4 bg-ink-3/50 xl:hidden" />
        <span>{typeLabel}</span>
      </p>

      <div className="md:col-span-6 md:col-start-1 md:row-start-2 xl:col-span-4 xl:col-start-3 xl:row-start-1">
        <h3 className="font-semiwide text-display-s font-semibold text-ink">{l(m.title)}</h3>
        <p className="mt-2 text-[0.95rem] font-medium leading-snug text-ink-2">{l(m.outlet)}</p>
        <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ink-2">{l(m.description)}</p>
        {m.url && (
          <SmartLink
            to={m.url}
            onClick={onOpen}
            className="group/link mt-4 inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-ink"
          >
            <span className="link group-hover/link:[background-size:100%_1px]">{m.cta ? l(m.cta) : t.mediaOpen}</span>
            <ArrowUpRight
              aria-hidden="true"
              size={16}
              strokeWidth={1.6}
              className="text-accent-ink transition-transform duration-500 ease-out-expo group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            />
          </SmartLink>
        )}
      </div>

      <div
        className={cn(
          'md:col-span-4 md:col-start-7 md:row-span-2 md:row-start-1 xl:row-span-1',
          isScreen(m.type) ? 'order-first md:order-none' : 'hidden md:block md:pt-1',
        )}
      >
        {visual}
      </div>
    </li>
  );
};

export default function Media() {
  const t = useT('offer');
  const l = useL();
  const first = groups[groups.length - 1]?.year;
  const last = groups[0]?.year;

  return (
    <section id="media" aria-labelledby="media-title" className="relative py-section">
      <div className="container-site">
        <SectionHeader
          id="media"
          label={t.mediaLabel}
          title={<span id="media-title">{l(t.mediaTitle)}</span>}
          intro={<p>{l(t.mediaIntro)}</p>}
          aside={
            first && last && first !== last ? (
              <p className="label tabular">
                {first} → {last}
              </p>
            ) : undefined
          }
        />

        <ol className="border-b border-line">
          {groups.map((g) => (
            <li key={g.year} className="border-t border-line md:grid md:grid-cols-12 md:gap-x-8 xl:gap-x-10">
              <div className="md:col-span-2">
                <p className="tabular pt-6 font-wide text-[2.25rem] font-extrabold leading-none tracking-[-0.045em] text-ink md:sticky md:top-[calc(var(--nav-h)+1.5rem)] md:pt-10 md:text-[clamp(1.75rem,3.2vw,3.25rem)]">
                  {g.year}
                </p>
              </div>
              <ol className="md:col-span-10">
                {g.items.map((item) => (
                  <MediaRow key={item.id} item={item} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
