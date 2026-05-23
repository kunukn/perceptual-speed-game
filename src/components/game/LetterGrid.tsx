import { cn } from '@/lib/utils';

type LetterGridProps = {
  top: string[];
  bottom: string[];
  matches?: boolean[]; // which columns are matching pairs; falls back to case-insensitive compare
  showMatches?: boolean; // color columns where letters match
  showColumnOutlines?: boolean; // thin outline around each column (intro + review)
  mirrorX?: boolean; // flip each glyph horizontally
  mirrorY?: boolean; // flip each glyph vertically
  className?: string;
};

export function LetterGrid({
  top,
  bottom,
  matches,
  showMatches,
  showColumnOutlines,
  mirrorX,
  mirrorY,
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

  const transform =
    [mirrorX && 'scaleX(-1)', mirrorY && 'scaleY(-1)']
      .filter(Boolean)
      .join(' ') || undefined;
  const glyphStyle = transform
    ? { transform, display: 'inline-block' as const }
    : undefined;

  return (
    <div
      className={cn(
        'font-hyperlegible flex min-h-22.5 w-fit min-w-62.5 items-center justify-center gap-1',
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
          <span className={cellCls(i)} style={glyphStyle}>
            {top[i]}
          </span>
          <span className={cellCls(i)} style={glyphStyle}>
            {bottom[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
