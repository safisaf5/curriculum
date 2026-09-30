import { cefrScale, type SpokenLanguage } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';

/** Seven segments, A1 → C2 then native. Shared by the bars and the scale header so they line up. */
export const SEGMENT_GAP = 'gap-[3px]';

export const cefrIndex = (language: SpokenLanguage) => cefrScale.indexOf(language.cefr);

/** Visible level: "Natif" for a mother tongue, else the data label ("B2-C1"). */
export const useCefrText = () => {
  const t = useT('skills');
  return (language: SpokenLanguage) => (language.cefr === 'native' ? t.cefrNative : language.cefrLabel);
};

interface CefrBarProps {
  language: SpokenLanguage;
  /** Base delay of the staggered fill, ms. */
  delay?: number;
  className?: string;
}

/**
 * Discreet CEFR graphic: reached segments in ink, the highest one in the
 * accent, the rest as hairline-coloured slots. Fills slide in from the left
 * on reveal (.reveal-line: skipped with reduced motion, shown without JS).
 */
export const CefrBar = ({ language, delay = 0, className }: CefrBarProps) => {
  const { l } = useI18n();
  const t = useT('skills');
  const reached = cefrIndex(language);
  const name = l(language.name);
  const label =
    language.cefr === 'native' ? l(t.cefrAriaNative(name)) : l(t.cefrAria(name, language.cefrLabel));

  return (
    <div role="img" aria-label={label} className={cn('flex', SEGMENT_GAP, className)}>
      {cefrScale.map((level, i) => (
        <span key={level} className="relative h-1.5 min-w-0 flex-1 overflow-hidden bg-line">
          {i <= reached && (
            <span
              className={cn('reveal-line absolute inset-0', i === reached ? 'bg-accent' : 'bg-ink')}
              style={{ '--reveal-delay': `${delay + i * 70}ms` } as React.CSSProperties}
            />
          )}
        </span>
      ))}
    </div>
  );
};

/** Scale captions aligned with the segments: A1 … C2, Natif. */
export const CefrScaleHeader = ({ className }: { className?: string }) => {
  const t = useT('skills');
  return (
    <div aria-hidden="true" className={cn('flex', SEGMENT_GAP, className)}>
      {cefrScale.map((level, i) => (
        <span
          key={level}
          className={cn(
            'label min-w-0 flex-1 whitespace-nowrap border-l border-line pl-1.5 pt-1 text-[0.625rem] leading-none',
            i === cefrScale.length - 1 && 'max-md:text-right',
          )}
        >
          {level === 'native' ? t.cefrNative : level}
        </span>
      ))}
    </div>
  );
};
