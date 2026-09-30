/**
 * Namespaced UI strings. Each namespace file exports
 *   export default defineStrings({ fr: {...}, en: {...} })
 * TypeScript forces the English object to have exactly the French keys.
 * Values are strings or small functions for plurals / interpolation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StringValue = string | ((...args: any[]) => string);
export type StringTable = Record<string, StringValue>;

export const defineStrings = <T extends StringTable>(table: { fr: T; en: { [K in keyof T]: T[K] } }) => table;
