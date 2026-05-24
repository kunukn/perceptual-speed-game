import dayjs from 'dayjs';
import { useLocation } from 'react-router';
import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatElapsed } from '@/features/game/machine';
import {
  useHighScores,
  type HighScore,
} from '@/features/game/store/high-scores';

export function Records() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scoresMap = useHighScores((s) => s.scores);
  const hasScores = Object.keys(scoresMap).length > 0;

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(paths.home);
  };

  /* Sort by recency so the run the player just completed bubbles to the top. */
  const scores = useMemo(
    () => Object.values(scoresMap).sort((a, b) => b.achievedAt - a.achievedAt),
    [scoresMap],
  );

  const handleClearScores = () => {
    useHighScores.getState().clear();
  };

  const formatDate = (ts: number): string =>
    dayjs(ts).format('YYYY-MM-DD HH:mm:ss');

  const formatVariant = (s: HighScore): string => {
    const parts: string[] = [];
    if (s.mode === 'count') {
      parts.push(t('options.questionsCount', { count: s.countTarget }));
    } else {
      const seconds = s.timeLimitMs / 1000;
      parts.push(
        seconds < 60
          ? t('options.timeLimit.seconds', { count: seconds })
          : t('options.timeLimit.minute', { count: seconds / 60 }),
      );
    }
    parts.push(t(`options.letterSystem.${s.letterSystem}`));
    if (s.mirrorX) parts.push(t('records.mirrorX'));
    if (s.mirrorY) parts.push(t('records.mirrorY'));

    return parts.join(', ');
  };

  const formatOutcome = (s: HighScore): string => {
    const correct = t('records.correct', { count: s.correct });
    if (s.mode === 'count') return `${correct}, ${formatElapsed(s.elapsedMs)}`;

    return correct;
  };

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <div className="flex w-full max-w-md gap-3">
          <Button size="lg" className="flex-1" onClick={handleBack}>
            {t('common.back')}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                disabled={!hasScores}
              >
                {t('records.clear')}
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>{t('records.clearConfirm')}</DialogTitle>
                <DialogDescription>
                  {t('records.clearConfirmDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t('common.cancel')}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleClearScores}>
                    {t('common.delete')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="w-full max-w-md space-y-3 text-slate-800">
        <h2 className="text-center text-xl font-semibold">
          {t('records.title')}
        </h2>

        {scores.length === 0 ? (
          <p className="text-center text-slate-500">{t('records.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {scores.map((s) => (
              <li
                key={s.key}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <div className="font-medium">{formatVariant(s)}</div>
                <div className="flex justify-between text-slate-600 tabular-nums">
                  <span>{formatOutcome(s)}</span>
                  <span>{formatDate(s.achievedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
