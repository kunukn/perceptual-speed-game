import { Navigate } from 'react-router';
import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { useConfetti } from '@/features/game/components/useConfetti';
import { formatElapsed } from '@/features/game/machine';
import { useGameMachine } from '@/features/game/machine-context';
import { useGameOptions } from '@/features/game/store/options';

export function Results() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, send, lastResultTier, consumeConfetti } = useGameMachine();
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);

  const isFinished = state.matches('finished');
  const { correct, answers, elapsedMs } = state.context;
  const answered = answers.length;
  const total = mode === 'time' ? answered : countTarget;
  const canvasRef = useConfetti(lastResultTier, consumeConfetti);

  if (state.matches('playing')) return <Navigate to={paths.play} replace />;

  if (!isFinished) return <Navigate to={paths.home} replace />;

  const handleRestart = () => {
    send({ type: 'RESTART' });
    navigate(paths.home);
  };

  return (
    <Layout
      header={<AppHeader />}
      overlay={
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 h-screen w-screen"
        />
      }
      footer={
        <div className="flex w-full justify-center gap-2 overflow-x-auto">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(paths.review)}
          >
            {t('results.review')}
          </Button>
          <Button size="lg" className="flex-1" onClick={handleRestart}>
            {t('results.restart')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(paths.records)}
          >
            {t('records.open')}
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
