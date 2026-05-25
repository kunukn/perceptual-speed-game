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
      id="layout-root"
      className={cn(
        'relative flex max-h-250 w-full max-w-2xl flex-1 flex-col bg-slate-50 *:px-6',
        className,
      )}
      data-testid="layout-root"
    >
      {overlay}
      <header className="sticky top-0 z-10 flex min-h-15 shrink-0 flex-col items-center justify-center-safe border-b border-slate-200 bg-slate-50 pt-4 pb-4">
        {header}
      </header>

      <section className="flex flex-1 flex-col items-center justify-center-safe py-4">
        {children}
      </section>

      {footer && (
        <footer className="sticky bottom-0 z-10 flex min-h-15 shrink-0 items-center justify-center gap-2 border-t border-slate-200 bg-slate-50">
          {footer}
        </footer>
      )}
    </div>
  );
}
