import { toolGroups } from '../../data';
import { useRevealChildren } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { pad2 } from '../../lib/text';

/** Everyday tools as a compact index: group label, tools inline, count. */
export const Toolbox = ({ index }: { index: string }) => {
  const { l } = useI18n();
  const t = useT('skills');
  const ref = useRevealChildren<HTMLDivElement>();
  const total = toolGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div ref={ref} className="mt-20 md:mt-24 xl:mt-14">
      <div className="reveal-line h-px w-full bg-ink" aria-hidden="true" />
      <div className="mt-4 flex items-baseline justify-between gap-6">
        <h3 id="skills-toolbox" className="label flex items-center gap-3 text-ink">
          <span className="tabular text-accent-ink">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
          {t.skillsToolbox}
        </h3>
        <p className="label tabular">{t.skillsTools(total)}</p>
      </div>

      <ul aria-labelledby="skills-toolbox" className="mt-8 md:mt-10">
        {toolGroups.map((g, i) => (
          <li
            key={g.id}
            className="reveal grid gap-y-2 border-t border-line py-5 md:grid-cols-12 md:gap-x-10 md:py-6 [&:last-child]:border-b"
            style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
          >
            <p className="label flex items-baseline gap-3 md:col-span-4 lg:col-span-3">
              <span className="tabular text-ink-3">{pad2(i + 1)}</span>
              <span className="text-ink-2">{l(g.label)}</span>
            </p>
            <ul className="flex flex-wrap gap-y-1 text-[0.98rem] leading-relaxed text-ink md:col-span-7 lg:col-span-8">
              {g.items.map((item, k) => (
                <li key={item} className="whitespace-nowrap">
                  {l(item)}
                  {k < g.items.length - 1 && (
                    <span aria-hidden="true" className="px-2.5 text-ink-3/70">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p aria-hidden="true" className="label hidden text-right tabular md:col-span-1 md:block">
              {pad2(g.items.length)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
