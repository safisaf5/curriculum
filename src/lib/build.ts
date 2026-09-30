/**
 * Build date, shared by the browser bundle, the prerender and the Node
 * generators so that every output agrees (no hydration mismatch on years).
 * Vite injects __BUILD_DATE__; Node scripts fall back to SITE_BUILD_DATE.
 */
declare const __BUILD_DATE__: string | undefined;

const fromEnv = (): string | undefined => {
  try {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    return proc?.env?.SITE_BUILD_DATE;
  } catch {
    return undefined;
  }
};

export const BUILD_DATE: string =
  (typeof __BUILD_DATE__ !== 'undefined' && __BUILD_DATE__) || fromEnv() || new Date().toISOString();

export const BUILD_YEAR = Number(BUILD_DATE.slice(0, 4));

/** 'YYYY-MM' of the build, used to decide what is ongoing. */
export const BUILD_MONTH = BUILD_DATE.slice(0, 7);
