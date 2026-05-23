import { Layout } from '@/components/layout/Layout';
import { GameTimer } from './GameTimer';
import { type GameMode, type Round } from './gameMachine';
import { PuzzleBoard } from './PuzzleBoard';

type Props = {
  round: Round;
  current: number;
  countTarget: number;
  mode: GameMode;
  showTimer: boolean;
  startedAt: number;
  onAnswer: (value: number) => void;
  onAbort: () => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function GamePlay({
  round,
  current,
  countTarget,
  mode,
  showTimer,
  startedAt,
  onAnswer,
  onAbort,
}: Props) {
  const { t } = useTranslation();

  return (
    <Layout
      header={
        <span className="flex items-center justify-center gap-2 text-slate-500 tabular-nums">
          <span>
            {mode === 'time'
              ? t('game.roundLabel', { current: pad2(current + 1) })
              : t('game.roundLabelOfTotal', {
                  current: pad2(current + 1),
                  total: pad2(countTarget),
                })}
          </span>
          {showTimer && (
            <>
              <span aria-hidden>·</span>
              <GameTimer startedAt={startedAt} />
            </>
          )}
        </span>
      }
      footer={
        <Button
          size="lg"
          className="min-w-60"
          variant="destructive"
          onClick={onAbort}
        >
          {t('game.abort')}
        </Button>
      }
    >
      <PuzzleBoard
        top={round.top}
        bottom={round.bottom}
        matches={round.matches}
        onAnswer={onAnswer}
      />
    </Layout>
  );
}
