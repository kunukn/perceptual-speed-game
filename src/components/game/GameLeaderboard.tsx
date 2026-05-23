import dayjs from 'dayjs';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { useHighScores, type HighScore } from '@/store/highScores';
import { formatElapsed } from './gameMachine';

type Props = {
  onBack: () => void;
};

export function GameLeaderboard({ onBack }: Props) {
  const { t } = useTranslation();
  const scoresMap = useHighScores((s) => s.scores);
  const clear = useHighScores((s) => s.clear);

  /* Sort by recency so the run the player just completed bubbles to the top. */
  const scores = useMemo(
    () => Object.values(scoresMap).sort((a, b) => b.achievedAt - a.achievedAt),
    [scoresMap],
  );

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
    if (s.mirrorX) parts.push(t('leaderboard.mirrorX'));
    if (s.mirrorY) parts.push(t('leaderboard.mirrorY'));

    return parts.join(', ');
  };

  const formatOutcome = (s: HighScore): string => {
    const correct = t('leaderboard.correct', { count: s.correct });
    if (s.mode === 'count') return `${correct}, ${formatElapsed(s.elapsedMs)}`;

    return correct;
  };

  const handleClear = () => {
    if (scores.length === 0) return;

    if (window.confirm(t('leaderboard.clearConfirm'))) clear();
  };

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <div className="flex w-full max-w-md gap-3">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={handleClear}
            disabled={scores.length === 0}
          >
            {t('leaderboard.clear')}
          </Button>
          <Button size="lg" className="flex-1" onClick={onBack}>
            {t('common.back')}
          </Button>
        </div>
      }
    >
      <div className="w-full max-w-md space-y-3 text-slate-800">
        <h2 className="text-center text-xl font-semibold">
          {t('leaderboard.title')}
        </h2>

        {scores.length === 0 ? (
          <p className="text-center text-slate-500">{t('leaderboard.empty')}</p>
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
