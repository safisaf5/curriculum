/** Tiny className joiner (no dependency). */
export const cn = (...parts: Array<string | false | null | undefined | 0>) => parts.filter(Boolean).join(' ');
