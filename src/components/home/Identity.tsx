import { Fragment, useState, type CSSProperties } from 'react';
import { profile, type Universe } from '../../data';
import { useRevealChildren } from '../../hooks';
import { useL, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { Portrait } from '../ui/Portrait';
import { SectionHeader } from '../ui/SectionHeader';
import { CropMarks } from './identity/CropMarks';
import { EvidenceLinks } from './identity/EvidenceLinks';
import { Story } from './identity/Story';
import { UniverseMark } from './identity/UniverseMark';

/**
 * 02 · Identity. A sticky portrait next to the four universes (the point is
 * the combination, not any single one), then the four-chapter story.
 */
export default function Identity() {
  const l = useL();
  const t = useT('home');
  const [active, setActive] = useState<Universe['id'] | null>(null);
  const listRef = useRevealChildren<HTMLOListElement>();

  return (
    <section id="about" aria-labelledby="about-title" className="relative pb-20 pt-section md:pb-28">
      <div className="container-site">
        <SectionHeader
          id="about"
          label={t.identityLabel}
          title={<span id="about-title">{l(profile.universesIntro.title)}</span>}
          intro={<p>{l(profile.universesIntro.body)}</p>}
        />

        <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-12">
          {/* Portrait: caption beside it on phones, under it (and sticky) from tablet up */}
          <figure className="grid grid-cols-[minmax(0,22rem)_auto] items-end gap-x-5 md:sticky md:top-[calc(var(--nav-h)+2rem)] md:col-span-5 md:block md:self-start lg:col-span-4">
            <div className="relative">
              <Portrait
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 66vw"
                className="block aspect-[3/4] overflow-hidden bg-bg-2"
                imgClassName="object-[50%_30%] dark:brightness-[0.9]"
              />
              <CropMarks />
            </div>
            <figcaption className="label flex flex-col gap-4 pb-1 leading-[1.5] md:mt-6 md:flex-row md:items-center md:justify-between md:pb-0">
              <span className="flex flex-col items-start gap-2.5 text-ink-2 md:flex-row md:items-center">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-accent" />
                <span>
                  <span className="block md:inline">{profile.givenName}</span>{' '}
                  <span className="block md:inline">{profile.familyName}</span>
                </span>
              </span>
              <span>
                <span className="block md:inline">{l(profile.location.city)},</span>{' '}
                <span className="block md:inline">{l(profile.location.country)}</span>
              </span>
            </figcaption>
          </figure>

          {/* Universes */}
          <div className="md:col-span-7 lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
            <div className="flex items-center gap-5 pb-8" aria-hidden="true">
              <UniverseMark active={active} className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
              <p className="label leading-[1.8]">
                {profile.universes.map((u, i) => (
                  <Fragment key={u.id}>
                    {i > 0 && (
                      <>
                        {' '}
                        <span className="px-1 text-ink-3/70">×</span>{' '}
                      </>
                    )}
                    <span
                      className={cn(
                        'transition-colors duration-300',
                        active === u.id ? 'text-accent-ink' : 'text-ink-2',
                      )}
                    >
                      {l(u.label)}
                    </span>
                  </Fragment>
                ))}
              </p>
            </div>

            <ol ref={listRef} className="border-b border-line">
              {profile.universes.map((u, i) => (
                <li
                  key={u.id}
                  onPointerEnter={() => setActive(u.id)}
                  onPointerLeave={() => setActive((v) => (v === u.id ? null : v))}
                  onFocus={() => setActive(u.id)}
                  onBlur={() => setActive((v) => (v === u.id ? null : v))}
                  className="reveal group relative grid grid-cols-[2.75rem_1fr] border-t border-line py-9 sm:grid-cols-[4rem_1fr] md:py-11"
                  style={{ '--reveal-delay': `${i * 80}ms` } as CSSProperties}
                >
                  {/* Accent marker: draws along the rule on hover / focus */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out-expo group-focus-within:scale-x-100 group-hover:scale-x-100"
                  />
                  <span aria-hidden="true" className="label tabular pt-[0.55em] text-accent-ink">
                    {pad2(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semiwide text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-none tracking-[-0.03em] text-ink transition-transform duration-500 ease-out-expo md:group-hover:translate-x-2">
                      {l(u.label)}
                    </h3>
                    <p className="label mt-5 leading-[1.6] text-ink-2">{l(u.domains)}</p>
                    <p className="mt-4 max-w-[50ch] text-[1.0625rem] leading-relaxed text-ink-2 md:text-[1.125rem]">
                      {l(u.body)}
                    </p>
                    <EvidenceLinks ids={u.evidence} label={t.identityProof} from="identity" className="mt-6" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Story />
      </div>
    </section>
  );
}
