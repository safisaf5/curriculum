import { cn } from '../../../lib/cn';

/** Four printer's crop marks around a figure. Purely decorative. */
export const CropMarks = ({ className }: { className?: string }) => {
  const mark = 'absolute h-3 w-3 border-ink-3/70';
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute -inset-2', className)}>
      <span className={cn(mark, 'left-0 top-0 border-l border-t')} />
      <span className={cn(mark, 'right-0 top-0 border-r border-t')} />
      <span className={cn(mark, 'bottom-0 left-0 border-b border-l')} />
      <span className={cn(mark, 'bottom-0 right-0 border-b border-r')} />
    </span>
  );
};
