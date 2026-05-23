import { cn } from '@/lib/utils';

type LetterGridProps = {
  top: string[];
  bottom: string[];
  matches?: boolean[]; // which columns are matching pairs; falls back to case-insensitive compare
  showMatches?: boolean; // color columns where letters match
  showColumnOutlines?: boolean; // thin outline around each column (intro + review)
  className?: string;
};

export function LetterGrid({
  top,
  bottom,
  matches,
  showMatches,
  showColumnOutlines,
  className,
}: LetterGridProps) {
  const isMatch = (i: number) =>
    !!showMatches &&
    (matches
      ? !!matches[i]
      : top[i]?.toLowerCase() === bottom[i]?.toLowerCase());

  const cellCls = (i: number) =>
    cn(
      'text-center tabular-nums',
      isMatch(i) ? 'text-emerald-600' : 'text-slate-700',
    );

  return (
    <div
      className={cn(
        'flex min-h-22.5 w-fit min-w-62.5 items-center justify-center gap-1',
        className,
      )}
    >
      {top.map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col items-center gap-y-1 rounded-sm border py-[0.05em]',
            showColumnOutlines ? 'border-slate-200' : 'border-transparent',
          )}
          style={{ width: '1.6em' }}
        >
          <span className={cellCls(i)}>{top[i]}</span>
          <span className={cellCls(i)}>{bottom[i]}</span>
        </div>
      ))}
    </div>
  );
}
