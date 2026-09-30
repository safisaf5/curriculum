/**
 * True while the client is hydrating the prerendered HTML of the first page.
 * Set by entry-client.tsx before hydrateRoot, cleared after the first commit.
 * Client-side navigations render normally (never deferred).
 */
let hydrating = false;

export const setHydrating = (value: boolean) => {
  hydrating = value;
};

export const isHydrating = () => hydrating;
