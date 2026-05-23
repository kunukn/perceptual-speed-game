import { formatElapsed } from './gameMachine';

type Props = {
  correct: number;
  total: number;
  elapsedMs: number;
  onRestart: () => void;
  onReview: () => void;
};

export function GameResults({
  correct,
  total,
  elapsedMs,
  onRestart,
  onReview,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 text-center text-slate-800">
      <h2 className="text-xl font-semibold">{t('results.title')}</h2>
      <p className="text-3xl font-bold">
        {correct} / {total}
      </p>
      <p className="mb-6 text-slate-500">
        {t('results.time', { elapsed: formatElapsed(elapsedMs) })}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button size="lg" className="w-60 max-w-full" onClick={onRestart}>
          {t('results.restart')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-60 max-w-full"
          onClick={onReview}
        >
          {t('results.review')}
        </Button>
      </div>
    </div>
  );
}
