/**
 * Deterministic randomness for generated artwork. The same slug always gives
 * the same drawing, on the server and on the client (no Math.random).
 */

/** FNV-1a 32-bit hash of a string. */
export const hashString = (value: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** mulberry32: tiny, fast, good enough for drawing. Returns floats in [0, 1). */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Rng = ReturnType<typeof mulberry32>;

export const rngFor = (key: string) => mulberry32(hashString(key));

/** Integer in [min, max] (inclusive). */
export const between = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

/** Float in [min, max). */
export const range = (rng: Rng, min: number, max: number) => min + rng() * (max - min);

/** Short, stable numbers for SVG path data. */
export const n1 = (v: number) => Math.round(v * 10) / 10;
