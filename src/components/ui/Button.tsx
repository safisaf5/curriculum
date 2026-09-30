import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SmartLink, type SmartLinkProps } from './SmartLink';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Icon = 'right' | 'up-right' | 'down' | 'none';

const ICONS = {
  right: ArrowRight,
  'up-right': ArrowUpRight,
  down: ArrowDown,
} as const;

const Arrow = ({ icon }: { icon: Icon }) => {
  if (icon === 'none') return null;
  const Cmp = ICONS[icon];
  return (
    <Cmp
      aria-hidden="true"
      size={17}
      strokeWidth={1.6}
      className={cn('btn-arrow shrink-0', icon === 'down' && 'btn-arrow-down')}
    />
  );
};

interface ButtonLinkProps extends SmartLinkProps {
  variant?: Variant;
  icon?: Icon;
  children: ReactNode;
}

/** Link styled as a button (the site only uses links for CTAs, never fake buttons). */
export const ButtonLink = ({ variant = 'primary', icon = 'right', className, children, ...rest }: ButtonLinkProps) => (
  <SmartLink className={cn('btn', `btn-${variant}`, className)} {...rest}>
    <span>{children}</span>
    <Arrow icon={icon} />
  </SmartLink>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: Icon;
}

export const Button = ({ variant = 'primary', icon = 'none', className, children, type = 'button', ...rest }: ButtonProps) => (
  <button type={type} className={cn('btn', `btn-${variant}`, className)} {...rest}>
    <span>{children}</span>
    <Arrow icon={icon} />
  </button>
);
