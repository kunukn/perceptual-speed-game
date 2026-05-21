type Props = {
  correct: number;
  total: number;
  elapsedMs: number;
  onRestart: () => void;
};

export function GameResults({ correct, total, elapsedMs, onRestart }: Props) {
  return (
    <div className="space-y-3 text-center text-slate-800">
      <h2 className="text-xl font-semibold">Results</h2>
      <p className="text-3xl font-bold">
        {correct} / {total}
      </p>
      <p className="mb-6 text-slate-500">
        Time: {(elapsedMs / 1000).toFixed(1)}s
      </p>
      <Button size="lg" className="w-60 max-w-full" onClick={onRestart}>
        Restart
      </Button>
    </div>
  );
}
