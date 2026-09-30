/** @jsxRuntime automatic @jsxImportSource react */
/**
 * PDF CV, French and English, generated from /src/data with @react-pdf/renderer.
 *
 *   public/files/Safwan-Abdirahman-CV-FR.pdf
 *   public/files/Safwan-Abdirahman-CV-EN.pdf
 *
 * The site's identity on paper: white page, ink text, hairlines, mono
 * uppercase labels, one vermilion accent for small markers. Two columns
 * (main 64%, side 36%), entries never split across pages, a fixed footer
 * with the web version link, the update date and page numbers.
 */
import { Fragment, type ReactNode } from 'react';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Document, Font, Image, Link, Page, Path, Svg, Text, View, renderToFile, type Styles } from '@react-pdf/renderer';
import {
  awards,
  cefrScale,
  education,
  engagement,
  experience,
  interests,
  languages,
  permits,
  profile,
  projects,
  skillGroups,
  toolGroups,
  type Education,
  type Experience,
  type L,
  type Lang,
  type Period,
  type SpokenLanguage,
} from '../../src/data';
import { getStrings } from '../../src/i18n';
import { BUILD_DATE } from '../../src/lib/build';
import { formatPeriod, formatYearMonth, isOngoing } from '../../src/lib/dates';
import { localize } from '../../src/lib/text';
import { FILES, SITE_URL, localizePath } from '../../src/site';
import { FAMILY, FONT_FILES, fontSafe } from './fonts';

// ── Print tokens ───────────────────────────────────────────────

const C = {
  paper: '#FFFFFF',
  ink: '#0E0E0F',
  ink2: '#4A4844',
  ink3: '#6B6862',
  line: '#D6D2C9',
  accent: '#E23D1E',
};

const PT = {
  lede: 9.2,
  body: 8.5,
  title: 9.1,
  side: 8.1,
  meta: 6.6,
};

/** Page geometry (A4 is 595.28 x 841.89 pt). */
const MARGIN_X = 40;
const FOOTER_TOP = 806;
const FOOTER_PAD = 6;

const NBSP = String.fromCharCode(0xa0);
/** Separator glued to the word before it, so a line never starts with it. */
const DOT = `${NBSP}·`;
const SEP = `${DOT} `;
// react-pdf treats a style change inside a word as a hyphenation point and
// may break there with a stray "-". Mixed-style lines below therefore only
// change style right before a regular space: "Role ·" | " Company".

let fontsReady = false;
const registerFonts = () => {
  if (fontsReady) return;
  Font.register({
    family: FAMILY.sans,
    fonts: ([400, 500, 600, 700, 800] as const).map((w) => ({ src: FONT_FILES.archivo[w], fontWeight: w })),
  });
  Font.register({
    family: FAMILY.mono,
    fonts: ([400, 500] as const).map((w) => ({ src: FONT_FILES.mono[w], fontWeight: w })),
  });
  Font.register({ family: FAMILY.wide, src: FONT_FILES.wide800, fontWeight: 800 });
  Font.register({ family: FAMILY.semiwide, src: FONT_FILES.semiwide500, fontWeight: 500 });
  // Never hyphenate: words stay whole, as on the site.
  Font.registerHyphenationCallback((word) => [word]);
  fontsReady = true;
};

const s = {
  page: {
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: FAMILY.sans,
    fontSize: PT.body,
    lineHeight: 1.38,
    paddingTop: 34,
    paddingBottom: 48,
    paddingHorizontal: MARGIN_X,
  },
  mono: {
    fontFamily: FAMILY.mono,
    fontSize: PT.meta,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    color: C.ink3,
    lineHeight: 1.3,
  },
  link: { textDecoration: 'none' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  columns: { flexDirection: 'row', marginTop: 16 },
  main: { width: '64%', paddingRight: 14 },
  side: { width: '36%', paddingLeft: 10 },
  section: { marginBottom: 9 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.7,
    borderTopColor: C.ink,
    paddingTop: 4.5,
    marginBottom: 7,
  },
  sectionIndex: { fontFamily: FAMILY.mono, fontSize: PT.meta, color: C.accent, letterSpacing: 0.4 },
  sectionRule: { width: 10, height: 0.6, backgroundColor: C.ink3, marginHorizontal: 5 },
  sectionLabel: {
    fontFamily: FAMILY.mono,
    fontWeight: 500,
    fontSize: PT.meta,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: C.ink,
  },
  entry: { marginBottom: 6 },
  headline: { flex: 1, paddingRight: 8, fontSize: PT.body, lineHeight: 1.32, color: C.ink2 },
  strong: { fontWeight: 600, fontSize: PT.title, color: C.ink },
  desc: { color: C.ink2, fontSize: PT.body, marginTop: 1.5, lineHeight: 1.37 },
  compact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2.3,
    borderBottomWidth: 0.4,
    borderBottomColor: C.line,
  },
  compactText: { flex: 1, paddingRight: 8, fontSize: PT.side, lineHeight: 1.3, color: C.ink2 },
  subLabel: { marginTop: 3, marginBottom: 2.5 },
  sideTitle: { fontWeight: 600, fontSize: PT.body, lineHeight: 1.3 },
  sideText: { fontSize: PT.side, color: C.ink2, lineHeight: 1.38 },
} satisfies Styles;

// ── Helpers ────────────────────────────────────────────────────

/** Localise, polish and make safe for the embedded fonts. */
const tx = (value: L | string | undefined, lang: Lang) => fontSafe(localize(value, lang));

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const absolute = (path: string, lang: Lang) => {
  const local = localizePath(path, lang);
  return local === '/' ? SITE_URL : `${SITE_URL}${local}`;
};

/** "HEPIA · Haute école du paysage..." → "HEPIA" for one-line entries. */
const shortName = (name: string) => name.split(' · ')[0];

const Arrow = ({ color = C.ink3, size = 5 }: { color?: string; size?: number }) => (
  <Svg width={size * 1.6} height={size} viewBox="0 0 16 10" style={{ marginHorizontal: 2.2 }}>
    <Path d="M0.5 5 H14.5 M10.5 1 L14.5 5 L10.5 9" stroke={color} strokeWidth={1.1} fill="none" />
  </Svg>
);

/**
 * A period in mono. The arrow of formatPeriod ("2020 → 2024") is drawn,
 * since the Latin subset of the fonts has no arrow glyph.
 */
const PeriodMeta = ({ period, lang, color = C.ink3 }: { period: Period; lang: Lang; color?: string }) => {
  const parts = formatPeriod(period, lang).split(' → ');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1.4 }}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <Arrow color={color} />}
          <Text style={[s.mono, { color }]}>{fontSafe(part)}</Text>
        </Fragment>
      ))}
    </View>
  );
};

const Section = ({ index, label, children }: { index: number; label: string; children: ReactNode }) => (
  <View style={s.section}>
    <View style={s.sectionHead} minPresenceAhead={40} wrap={false}>
      <Text style={s.sectionIndex}>{String(index).padStart(2, '0')}</Text>
      <View style={s.sectionRule} />
      <Text style={s.sectionLabel}>{fontSafe(label)}</Text>
    </View>
    {children}
  </View>
);

const SubLabel = ({ children }: { children: string }) => (
  <View style={s.subLabel} minPresenceAhead={30}>
    <Text style={s.mono}>{fontSafe(children)}</Text>
  </View>
);

/** One-line entry: title, detail, period on the right. */
const CompactLine = ({ title, detail, period, lang }: { title: string; detail?: string; period: Period; lang: Lang }) => (
  <View style={s.compact} wrap={false}>
    <Text style={s.compactText}>
      <Text style={{ fontWeight: 500, color: C.ink }}>{detail ? `${title}${DOT}` : title}</Text>
      {detail ? ` ${detail}` : ''}
    </Text>
    <PeriodMeta period={period} lang={lang} />
  </View>
);

// ── Header ─────────────────────────────────────────────────────

const Header = ({ lang, portrait }: { lang: Lang; portrait?: Buffer }) => {
  const cv = getStrings('cv', lang);
  const { contact } = profile;
  const contacts = [
    { label: contact.email, href: `mailto:${contact.email}` },
    { label: contact.phone, href: `tel:${contact.phoneE164}` },
    { label: host(contact.linkedin), href: contact.linkedin },
    { label: host(contact.website), href: absolute('/', lang) },
  ];
  const nameStyle = {
    fontFamily: FAMILY.wide,
    fontWeight: 800,
    fontSize: 27,
    lineHeight: 0.9,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } as const;
  const slash = <Text style={[s.mono, { marginHorizontal: 6, color: C.line }]}>/</Text>;
  return (
    <View>
      <View style={[s.row, { alignItems: 'center', marginBottom: 11 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4.5, height: 4.5, backgroundColor: C.accent, marginRight: 6 }} />
          <Text style={[s.mono, { color: C.ink }]}>{fontSafe(cv.cvTitle)}</Text>
        </View>
        <Text style={s.mono}>{`${tx(profile.location.city, lang)}, ${tx(profile.location.country, lang)}`}</Text>
      </View>

      <View style={[s.row, { alignItems: 'flex-end' }]}>
        <View style={{ flex: 1 }}>
          <Text style={nameStyle}>{fontSafe(profile.givenName)}</Text>
          <Text style={nameStyle}>
            {fontSafe(profile.familyName)}
            <Text style={{ color: C.accent }}>.</Text>
          </Text>
          <Text style={{ fontFamily: FAMILY.semiwide, fontWeight: 500, fontSize: 12, marginTop: 8, lineHeight: 1.2 }}>
            {tx(profile.title, lang)}
          </Text>
        </View>
        {portrait && <Image src={{ data: portrait, format: 'jpg' }} style={{ width: 64, height: 64 }} />}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 9, paddingTop: 6, borderTopWidth: 0.6, borderTopColor: C.line }}>
        {contacts.map((c) => (
          <Fragment key={c.href}>
            <Link src={c.href} style={[s.mono, s.link, { textTransform: 'none', letterSpacing: 0.15, fontSize: 7.2, color: C.ink }]}>
              {fontSafe(c.label)}
            </Link>
            {slash}
          </Fragment>
        ))}
        <Text style={[s.mono, { textTransform: 'none', letterSpacing: 0.15, fontSize: 7.2, color: C.ink2 }]}>
          {tx(`${cv.cvNationality}${lang === 'fr' ? ' : ' : ': '}${localize(profile.nationality, lang)}`, lang)}
        </Text>
      </View>
    </View>
  );
};

// ── Main column ────────────────────────────────────────────────

const ExperienceEntry = ({ item, lang }: { item: Experience; lang: Lang }) => {
  const company = [tx(item.company, lang), item.location && tx(item.location, lang)].filter(Boolean).join(', ');
  return (
    <View style={s.entry} wrap={false}>
      <View style={s.row}>
        <Text style={s.headline}>
          <Text style={s.strong}>{`${tx(item.role, lang)}${DOT}`}</Text>
          {' '}
          {item.link ? (
            <Link src={item.link} style={[s.link, { color: C.ink2 }]}>
              {company}
            </Link>
          ) : (
            company
          )}
        </Text>
        <PeriodMeta period={item.period} lang={lang} />
      </View>
      {item.description ? <Text style={s.desc}>{tx(item.description, lang)}</Text> : null}
    </View>
  );
};

const educationStatus = (item: Education, lang: Lang) => {
  if (item.status) return tx(item.status, lang);
  if (isOngoing(item.period)) return fontSafe(getStrings('pdf', lang).inProgress);
  return undefined;
};

const EducationEntry = ({ item, lang }: { item: Education; lang: Lang }) => {
  const status = educationStatus(item, lang);
  return (
    <View style={s.entry} wrap={false}>
      <View style={s.row}>
        <Text style={[s.headline, s.strong, { lineHeight: 1.28 }]}>{tx(item.program, lang)}</Text>
        <PeriodMeta period={item.period} lang={lang} />
      </View>
      <Text style={[s.desc, { marginTop: 0.5 }]}>
        {[tx(item.institution, lang), item.location && tx(item.location, lang)].filter(Boolean).join(', ')}
      </Text>
      {item.result ? <Text style={[s.desc, { color: C.ink }]}>{tx(item.result, lang)}</Text> : null}
      {status ? <Text style={[s.mono, { marginTop: 2, color: item.status ? C.ink2 : C.accent }]}>{status}</Text> : null}
      {item.description ? <Text style={s.desc}>{tx(item.description, lang)}</Text> : null}
    </View>
  );
};

const MainColumn = ({ lang }: { lang: Lang }) => {
  const cv = getStrings('cv', lang);
  const pdf = getStrings('pdf', lang);
  const roles = experience.filter((x) => x.type !== 'internship');
  const internships = experience.filter((x) => x.type === 'internship');
  const featured = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);
  const studies = education.filter((e) => e.kind !== 'school' && e.kind !== 'course');
  const courses = education.filter((e) => e.kind === 'course');
  const schools = education.filter((e) => e.kind === 'school');

  return (
    <View style={s.main}>
      <Section index={1} label={cv.cvProfile}>
        <Text style={{ fontSize: PT.lede, lineHeight: 1.45 }}>{tx(profile.summary, lang)}</Text>
      </Section>

      <Section index={2} label={cv.cvExperience}>
        {roles.map((item) => (
          <ExperienceEntry key={item.id} item={item} lang={lang} />
        ))}
        <SubLabel>{pdf.internships}</SubLabel>
        {internships.map((item) => (
          <CompactLine key={item.id} title={shortName(tx(item.company, lang))} detail={tx(item.role, lang)} period={item.period} lang={lang} />
        ))}
      </Section>

      <Section index={3} label={cv.cvProjects}>
        {featured.map((p) => {
          const url = absolute(`/projects/${p.slug}`, lang);
          return (
            <View key={p.slug} style={s.entry} wrap={false}>
              <View style={[s.row, { alignItems: 'baseline' }]}>
                <Link src={url} style={[s.link, s.strong]}>
                  {tx(p.name, lang)}
                </Link>
                <Link src={url} style={[s.mono, s.link, { textTransform: 'none', letterSpacing: 0.1 }]}>
                  {fontSafe(host(url))}
                </Link>
              </View>
              <Text style={[s.desc, { marginTop: 0.5 }]}>{tx(p.tagline, lang)}</Text>
            </View>
          );
        })}
      </Section>

      <Section index={4} label={cv.cvEducation}>
        {studies.map((item) => (
          <EducationEntry key={item.id} item={item} lang={lang} />
        ))}
        {courses.map((item) => (
          <CompactLine key={item.id} title={tx(item.program, lang)} detail={tx(item.institution, lang)} period={item.period} lang={lang} />
        ))}
        <SubLabel>{pdf.schooling}</SubLabel>
        {schools.map((item) => (
          <CompactLine key={item.id} title={tx(item.institution, lang)} detail={tx(item.program, lang)} period={item.period} lang={lang} />
        ))}
      </Section>
    </View>
  );
};

// ── Side column ────────────────────────────────────────────────

/** Six CEFR steps (A1 to C2); a native language fills them all. */
const CefrBar = ({ language }: { language: SpokenLanguage }) => {
  const reached = Math.min(cefrScale.indexOf(language.cefr), 5);
  return (
    <View style={{ flexDirection: 'row', marginTop: 3.2 }}>
      {cefrScale.slice(0, 6).map((step, i) => (
        <View key={step} style={{ width: 9, height: 2.2, marginLeft: 1.5, backgroundColor: i <= reached ? C.ink : C.line }} />
      ))}
    </View>
  );
};

const SideColumn = ({ lang }: { lang: Lang }) => {
  const cv = getStrings('cv', lang);
  return (
    <View style={s.side}>
      <Section index={5} label={cv.cvLanguages}>
        {languages.map((language) => (
          <View key={language.code} style={s.entry} wrap={false}>
            <View style={[s.row, { alignItems: 'center' }]}>
              <Text style={s.sideTitle}>{tx(language.name, lang)}</Text>
              <Text style={[s.mono, { color: C.ink }]}>{fontSafe(language.cefrLabel)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.sideText}>{tx(language.level, lang)}</Text>
              <CefrBar language={language} />
            </View>
            {language.certification ? (
              <View style={{ marginTop: 2 }}>
                <Text style={[s.sideText, { color: C.ink }]}>{fontSafe(language.certification.name)}</Text>
                <Text style={[s.sideText, { color: C.ink3 }]}>
                  {`${tx(language.certification.detail, lang)}${SEP}${fontSafe(formatYearMonth(language.certification.date, lang))}`}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </Section>

      <Section index={6} label={cv.cvSkills}>
        {skillGroups.map((group) => (
          <View key={group.id} style={{ marginBottom: 5.5 }} wrap={false}>
            <Text style={[s.mono, { marginBottom: 1 }]}>{tx(group.label, lang)}</Text>
            <Text style={[s.sideText, { color: C.ink }]}>{group.items.map((item) => tx(item.name, lang)).join(SEP)}</Text>
          </View>
        ))}
      </Section>

      <Section index={7} label={cv.cvTools}>
        {toolGroups.map((group) => (
          <View key={group.id} style={{ marginBottom: 5.5 }} wrap={false}>
            <Text style={[s.mono, { marginBottom: 1 }]}>{tx(group.label, lang)}</Text>
            <Text style={s.sideText}>{group.items.map((item) => fontSafe(item)).join(SEP)}</Text>
          </View>
        ))}
      </Section>

      <Section index={8} label={cv.cvAwards}>
        {awards.map((award) => (
          <View key={award.id} style={s.entry} wrap={false}>
            <Text style={s.sideTitle}>{tx(award.title, lang)}</Text>
            <Text style={s.sideText}>{tx(award.event, lang)}</Text>
            <Text style={[s.mono, { marginTop: 1.2 }]}>{fontSafe(formatYearMonth(award.date, lang))}</Text>
          </View>
        ))}
      </Section>

      <Section index={9} label={cv.cvEngagement}>
        {engagement.map((item) => (
          <View key={item.id} style={s.entry} wrap={false}>
            <Text style={s.sideTitle}>{tx(item.name, lang)}</Text>
            <Text style={s.sideText}>{tx(item.role, lang)}</Text>
            {item.period ? <PeriodMeta period={item.period} lang={lang} /> : null}
          </View>
        ))}
      </Section>

      <Section index={10} label={cv.cvPermits}>
        {permits.map((permit) => (
          <Text key={permit.name.en} style={[s.sideText, { color: C.ink }]}>
            {tx(permit.name, lang)}
          </Text>
        ))}
      </Section>

      <Section index={11} label={cv.cvInterests}>
        <Text style={s.sideText}>{interests.map((item) => tx(item, lang)).join(SEP)}</Text>
      </Section>
    </View>
  );
};

// ── Page chrome ────────────────────────────────────────────────
// Fixed layers are anchored with `top`: react-pdf drops dynamic text
// anchored with `bottom`, and a `render` text nested in the footer row
// hides the whole footer, so page numbers get their own layer.

const PAGE_NUMBER_WIDTH = 26;

const Footer = ({ lang }: { lang: Lang }) => {
  const cv = getStrings('cv', lang);
  const webCv = absolute('/cv', lang);
  const updated = cv.cvUpdated(formatYearMonth(BUILD_DATE.slice(0, 10), lang));
  const slash = <Text style={[s.mono, { marginHorizontal: 6, color: C.line }]}>/</Text>;
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        left: MARGIN_X,
        right: MARGIN_X,
        top: FOOTER_TOP,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 0.6,
        borderTopColor: C.line,
        paddingTop: FOOTER_PAD,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Link src={SITE_URL} style={[s.mono, s.link, { color: C.ink }]}>
          {fontSafe(host(SITE_URL))}
        </Link>
        {slash}
        <Link src={webCv} style={[s.mono, s.link]}>
          {fontSafe(cv.cvWebVersion)}
        </Link>
        <Arrow color={C.accent} />
        <Link src={webCv} style={[s.mono, s.link, { color: C.ink, textTransform: 'none' }]}>
          {fontSafe(host(webCv))}
        </Link>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={s.mono}>{tx(updated, lang)}</Text>
        {slash}
        <View style={{ width: PAGE_NUMBER_WIDTH }} />
      </View>
    </View>
  );
};

const PageNumber = ({ lang }: { lang: Lang }) => {
  const pdf = getStrings('pdf', lang);
  return (
    <Text
      fixed
      style={[s.mono, { position: 'absolute', left: MARGIN_X, right: MARGIN_X, top: FOOTER_TOP + FOOTER_PAD, textAlign: 'right', color: C.ink }]}
      render={({ pageNumber, totalPages }) => pdf.pageOf(pageNumber, totalPages)}
    />
  );
};

/** From page 2 on: name and document title at the top. */
const RunningHead = ({ lang }: { lang: Lang }) => {
  const label = fontSafe(`${profile.name} · ${getStrings('cv', lang).cvTitle}`);
  return (
    <Text
      fixed
      style={[s.mono, { position: 'absolute', top: 18, left: MARGIN_X, right: MARGIN_X }]}
      render={({ pageNumber }) => (pageNumber > 1 ? label : '')}
    />
  );
};

// ── Document ───────────────────────────────────────────────────

const CvDocument = ({ lang, portrait }: { lang: Lang; portrait?: Buffer }) => {
  const cv = getStrings('cv', lang);
  const pdf = getStrings('pdf', lang);
  const date = new Date(BUILD_DATE);
  const keywords = [
    profile.name,
    ...profile.roles,
    ...skillGroups.flatMap((g) => g.items.slice(0, 3).map((item) => localize(item.name, lang))),
    localize(profile.location.city, lang),
  ];
  return (
    <Document
      title={fontSafe(`${profile.name} · ${cv.cvTitle}`)}
      author={profile.name}
      subject={fontSafe(pdf.subject(profile.name))}
      keywords={[...new Set(keywords)].join(', ')}
      creator={host(SITE_URL)}
      producer={host(SITE_URL)}
      language={lang === 'fr' ? 'fr-CH' : 'en'}
      creationDate={date}
      modificationDate={date}
    >
      <Page size="A4" style={s.page}>
        <RunningHead lang={lang} />
        <Footer lang={lang} />
        <PageNumber lang={lang} />
        <Header lang={lang} portrait={portrait} />
        <View style={s.columns}>
          <MainColumn lang={lang} />
          <SideColumn lang={lang} />
        </View>
      </Page>
    </Document>
  );
};

const countPages = (pdf: Buffer) => (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;

export const generateCvPdfs = async () => {
  registerFonts();
  await mkdir('public/files', { recursive: true });
  const portrait = await readFile('public/images/portrait-square-240.jpg').catch(() => undefined);
  const report: string[] = [];
  for (const lang of ['fr', 'en'] as const) {
    const out = join('public', FILES.cvPdf[lang]);
    await renderToFile(<CvDocument lang={lang} portrait={portrait} />, out);
    const pages = countPages(await readFile(out));
    if (pages > 3) throw new Error(`CV (${lang}) runs to ${pages} pages, 3 at most`);
    report.push(`${lang}: ${pages} pages`);
  }
  console.log(`    CV PDF ${report.join(', ')}`);
};
