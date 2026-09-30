import type { ReactNode } from 'react';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';

/** Shared look of every control: a large, borderless field sitting on a hairline. */
export const controlClass = (invalid: boolean) =>
  cn(
    'peer block w-full appearance-none rounded-none border-0 border-b bg-transparent px-0 pb-3.5 pt-2',
    'text-[1.0625rem] leading-snug text-ink placeholder:text-ink-3/60 sm:text-[1.125rem]',
    'transition-colors duration-300 ease-out-expo',
    // Keep the global accent outline, lighter and further out: it frames the field instead of boxing the text
    'focus-visible:outline-1 focus-visible:outline-offset-4',
    'autofill:shadow-[inset_0_0_0_100px_rgb(var(--c-bg))] autofill:[-webkit-text-fill-color:rgb(var(--c-ink))]',
    invalid ? 'border-accent-ink' : 'border-line hover:border-ink-3 focus:border-ink',
  );

export const errorId = (id: string) => `${id}-error`;

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Visible error message, already localised. */
  error?: string;
  /** Right side of the label row (character count...). */
  aside?: ReactNode;
  className?: string;
  /** The control. It must carry `controlClass()` (and so the `peer` class). */
  children: ReactNode;
}

/**
 * Label above, control on a hairline, error below. The hairline is doubled by
 * a 2px rule that draws from the left on focus (ink, or accent when invalid).
 * The error line keeps its height so the layout never jumps.
 */
export const Field = ({ id, label, required, error, aside, className, children }: FieldProps) => {
  const t = useT('contact');
  return (
    <div className={cn('group/field flex flex-col', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className={cn(
            'label transition-colors duration-300',
            error ? 'text-accent-ink' : 'group-focus-within/field:text-ink',
          )}
        >
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-1 text-accent-ink">*</span>
              <span className="sr-only"> ({t.required})</span>
            </>
          )}
        </label>
        {aside}
      </div>
      <div className="relative mt-2">
        {children}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out-expo peer-focus:scale-x-100',
            error ? 'bg-accent-ink' : 'bg-ink',
          )}
        />
      </div>
      <p id={errorId(id)} className="mt-2 flex min-h-[1.25rem] items-start gap-2 text-[0.8125rem] leading-snug text-accent-ink">
        {error && (
          <>
            <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 bg-accent" />
            <span>{error}</span>
          </>
        )}
      </p>
    </div>
  );
};
