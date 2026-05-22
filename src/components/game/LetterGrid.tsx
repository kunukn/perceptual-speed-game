import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

type LetterGridProps = {
  top: string[];
  bottom: string[];
  matches?: boolean[]; // which columns are matching pairs; falls back to case-insensitive compare
  showMatches?: boolean; // color columns where letters match
  showColumnArrows?: boolean; // down arrow above each column (intro example only)
  className?: string;
};

export function LetterGrid({
  top,
  bottom,
  matches,
  showMatches,
  showColumnArrows,
  className,
}: LetterGridProps) {
  const cols = top.length;
  const isMatch = (i: number) =>
    !!showMatches &&
    (matches
      ? !!matches[i]
      : top[i]?.toLowerCase() === bottom[i]?.toLowerCase());

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
      {showColumnArrows &&
        top.map((_, i) => (
          <span key={`a${i}`} className="flex justify-center">
            <ArrowDown className="h-4 w-4 text-slate-400" />
          </span>
        ))}
      {top.map((ch, i) => cell(ch, i, `t${i}`))}
      {bottom.map((ch, i) => cell(ch, i, `b${i}`))}
    </div>
  );
}
