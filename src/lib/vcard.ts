import { profile } from '../data/profile';

/** Escape a vCard text value (RFC 6350 §3.4). */
const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/** Fold lines longer than 75 octets (RFC 6350 §3.2), UTF-8 safe. */
const fold = (line: string): string => {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + n > limit) {
      out.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join('\r\n ');
};

/**
 * vCard 3.0 (best compatibility with iOS and Android contacts),
 * built from the profile data. `photoJpegBase64` is optional.
 */
export const buildVcard = (photoJpegBase64?: string): string => {
  const c = profile.contact;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(profile.familyName)};${esc(profile.givenName)};;;`,
    `FN:${esc(profile.name)}`,
    `TITLE:${esc('Entrepreneur · AI · Technology')}`,
    `EMAIL;TYPE=INTERNET,PREF:${c.email}`,
    `TEL;TYPE=CELL,VOICE,PREF:${c.phoneE164}`,
    `ADR;TYPE=WORK:;;;${esc(profile.location.city.fr)};${profile.location.region};;${esc(profile.location.country.fr)}`,
    `URL:${c.website}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${c.linkedin}`,
    `item1.URL:${c.linkedin}`,
    'item1.X-ABLabel:LinkedIn',
    `item2.URL:${c.whatsapp}`,
    'item2.X-ABLabel:WhatsApp',
    `NOTE:${esc(profile.positioning)}`,
    ...(photoJpegBase64 ? [`PHOTO;ENCODING=b;TYPE=JPEG:${photoJpegBase64}`] : []),
    'END:VCARD',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
};
