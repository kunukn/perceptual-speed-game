import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { formatElapsed, type GameMode } from './gameMachine';
import { useConfetti } from './useConfetti';

type Props = {
  mode: GameMode;
  correct: number;
  total: number;
  elapsedMs: number;
  onRestart: () => void;
  onReview: () => void;
};

export function GameResults({
  mode,
  correct,
  total,
  elapsedMs,
  onRestart,
  onReview,
}: Props) {
  const { t } = useTranslation();
  const canvasRef = useConfetti(mode === 'count' && correct === total);

  return (
    <Layout
      header={<AppHeader />}
      overlay={
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      }
      footer={
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            className="w-40 max-w-full"
            onClick={onReview}
          >
            {t('results.review')}
          </Button>
          <Button size="lg" className="w-40 max-w-full" onClick={onRestart}>
            {t('results.restart')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-center text-slate-800">
        <h2 className="text-xl font-semibold">{t('results.title')}</h2>
        <p className="text-3xl font-bold">
          {correct} / {total}
        </p>
        <p className="text-slate-500">
          {t('results.time', { elapsed: formatElapsed(elapsedMs) })}
        </p>
      </div>
    </Layout>
  );
}
