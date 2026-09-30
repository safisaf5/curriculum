import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang, useT } from '../../i18n';
import { localizePath, parsePath } from '../../site';

export interface SmartLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /**
   * - internal path, language-neutral: '/cv', '/projects/sbsa', '/#contact'
   * - external: 'https://…' (opens in a new tab), 'mailto:', 'tel:'
   * - static file: '/files/…' (plain <a>, add `download` if needed)
   */
  to: string;
  children: ReactNode;
  /** Do not localise the path (already localised or language-independent). */
  raw?: boolean;
}

const isExternal = (to: string) => /^(https?:)?\/\//.test(to);
const isProtocol = (to: string) => /^(mailto|tel|sms):/.test(to);
const isFile = (to: string) => /^\/(files|og|images)\//.test(to) || /\.(pdf|vcf|png|jpe?g|webp|avif)$/i.test(to);

/**
 * One link component for the whole site. Handles language prefixes,
 * in-page anchors (smooth scroll on the home page, navigation elsewhere),
 * external links and downloadable files.
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink(
  { to, children, raw, onClick, ...rest },
  ref,
) {
  const lang = useLang();
  const t = useT('common');
  const location = useLocation();
  const navigate = useNavigate();

  if (isExternal(to)) {
    return (
      <a ref={ref} href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} {...rest}>
        {children}
        <span className="sr-only"> {t.newTab}</span>
      </a>
    );
  }
  if (isProtocol(to) || isFile(to)) {
    return (
      <a ref={ref} href={to} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  const href = raw ? to : localizePath(to, lang);
  const hashIndex = href.indexOf('#');

  if (hashIndex >= 0) {
    const targetPath = href.slice(0, hashIndex) || '/';
    const id = href.slice(hashIndex + 1);
    const onHome = parsePath(location.pathname).path === parsePath(targetPath).path && parsePath(location.pathname).lang === parsePath(targetPath).lang;

    const handle = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (onHome) {
        const el = document.getElementById(id);
        if (el) {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          window.history.replaceState(window.history.state, '', `#${id}`);
          // Move focus for keyboard and screen reader users
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        }
      } else {
        navigate(href);
      }
    };

    return (
      <a ref={ref} href={href} onClick={handle} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link ref={ref} to={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
});
