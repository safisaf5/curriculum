import type { TimelineYear } from '../../data';

/**
 * Column geometry of the timeline. A year gets one sub-column of entries per
 * three items (max four), so dense years grow wider instead of taller and every
 * column fits in the pinned viewport. Widths are fixed in rem, which lets the
 * year index position its marks in CSS (no measuring, identical on the server).
 */
export type Span = 1 | 2 | 3 | 4;

export const spanOf = (items: number): Span => Math.min(4, Math.max(1, Math.ceil(items / 3))) as Span;

/** Column width in rem, per breakpoint (md: carousel, lg: carousel or pinned track). */
const WIDTH_REM: Record<'md' | 'lg', Record<Span, number>> = {
  md: { 1: 20, 2: 34, 3: 34, 4: 34 },
  lg: { 1: 24, 2: 40, 3: 58, 4: 76 },
};

/** Matching Tailwind classes (kept literal so the compiler sees them). */
export const WIDTH_CLASS: Record<Span, string> = {
  1: 'md:w-[20rem] lg:w-[24rem]',
  2: 'md:w-[34rem] lg:w-[40rem]',
  3: 'md:w-[34rem] lg:w-[58rem]',
  4: 'md:w-[34rem] lg:w-[76rem]',
};

export const COLUMNS_CLASS: Record<Span, string> = {
  1: '',
  2: 'md:columns-2',
  3: 'md:columns-2 lg:columns-3',
  4: 'md:columns-2 lg:columns-4',
};

export interface RulerMark {
  /** Start of the year's column, in % of the whole track. */
  md: number;
  lg: number;
  /** Width of the year's column, in % of the whole track. */
  mdWidth: number;
  lgWidth: number;
}

/** Where each year starts on the track, as a share of the total width. */
export const rulerMarks = (years: TimelineYear[]): RulerMark[] => {
  const spans = years.map((y) => spanOf(y.items.length));
  const marks = (bp: 'md' | 'lg') => {
    const widths = spans.map((s) => WIDTH_REM[bp][s]);
    const total = widths.reduce((a, b) => a + b, 0);
    let acc = 0;
    return widths.map((w) => {
      const start = (acc / total) * 100;
      acc += w;
      return { start, width: (w / total) * 100 };
    });
  };
  const md = marks('md');
  const lg = marks('lg');
  return years.map((_, i) => ({ md: md[i].start, lg: lg[i].start, mdWidth: md[i].width, lgWidth: lg[i].width }));
};
