import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { useGameOptions } from '@/store/gameOptions';
import { formatElapsed } from './gameMachine';
import { useConfetti } from './useConfetti';

type Props = {
  correct: number;
  answered: number;
  elapsedMs: number;
  onRestart: () => void;
  onReview: () => void;
};

export function GameResults({
  correct,
  answered,
  elapsedMs,
  onRestart,
  onReview,
}: Props) {
  const { t } = useTranslation();
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);
  const total = mode === 'time' ? answered : countTarget;
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
        <div className="flex w-full max-w-md gap-3">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={onReview}
          >
            {t('results.review')}
          </Button>
          <Button size="lg" className="flex-1" onClick={onRestart}>
            {t('results.restart')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-center text-slate-800">
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
