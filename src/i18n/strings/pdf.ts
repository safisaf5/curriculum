import { defineStrings } from '../define';

/** Labels used only by the generated PDF CV (scripts/lib/cv-pdf.tsx). */
export default defineStrings({
  fr: {
    pageOf: (page: number, total: number) => `${page} / ${total}`,
  },
  en: {
    pageOf: (page: number, total: number) => `${page} / ${total}`,
  },
});
