import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  header: ReactNode;
  footer?: ReactNode;
  /** Absolutely positioned overlay rendered at the layout root (e.g. confetti canvas). Clipped by the outer overflow-hidden. */
  overlay?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Layout({
  header,
  footer,
  overlay,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'relative flex max-h-240 w-full max-w-2xl flex-1 flex-col overflow-hidden bg-slate-50 pt-4 *:px-6',
        className,
      )}
      data-testid="layout-root"
    >
      {overlay}
      <header className="relative shrink-0 overflow-y-auto border-b border-slate-200 pb-4">
        {header}
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center-safe overflow-y-auto py-4">
        {children}
      </section>

      {footer && (
        <footer className="flex min-h-15 shrink-0 items-center justify-center gap-2 overflow-y-auto border-t border-slate-200">
          {footer}
        </footer>
      )}
    </div>
  );
}
