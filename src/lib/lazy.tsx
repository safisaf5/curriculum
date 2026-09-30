import { lazy, type ComponentType } from 'react';

type Loader<P> = () => Promise<{ default: ComponentType<P> }>;

export type PreloadableComponent<P> = ComponentType<P> & { preload: () => Promise<void> };

/**
 * React.lazy with a `preload()` that resolves the module ahead of render.
 * Once preloaded, the component renders synchronously: the client can
 * hydrate prerendered HTML without suspending (no flash, no mismatch).
 */
export function lazyWithPreload<P extends object>(loader: Loader<P>): PreloadableComponent<P> {
  let Loaded: ComponentType<P> | null = null;
  let promise: Promise<void> | null = null;
  const Lazy = lazy(loader);

  const preload = () => {
    if (!promise) {
      promise = loader().then((m) => {
        Loaded = m.default;
      });
    }
    return promise;
  };

  const Component = (props: P) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Cmp = (Loaded ?? Lazy) as ComponentType<any>;
    return <Cmp {...props} />;
  };
  Component.preload = preload;
  return Component as PreloadableComponent<P>;
}
