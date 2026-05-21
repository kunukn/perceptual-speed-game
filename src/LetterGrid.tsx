import { cn } from './lib/utils';

type LetterGridProps = {
  top: string[];
  bottom: string[];
  showMatches?: boolean; // color columns where letters match (case-insensitive)
  className?: string;
};

export function LetterGrid({
  top,
  bottom,
  showMatches,
  className,
}: LetterGridProps) {
  const cols = top.length;
  const isMatch = (i: number) =>
    !!showMatches && top[i]?.toLowerCase() === bottom[i]?.toLowerCase();

  const cell = (ch: string, i: number, key: string) => (
    <span
      key={key}
      className={cn(
        'text-center tabular-nums',
        isMatch(i) ? 'text-emerald-600' : 'text-slate-700',
      )}
    >
      {ch}
    </span>
  );

  return (
    <div
      className={cn('grid w-fit gap-y-1', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, 1.6em)` }}
    >
      {top.map((ch, i) => cell(ch, i, `t${i}`))}
      {bottom.map((ch, i) => cell(ch, i, `b${i}`))}
    </div>
  );
}
