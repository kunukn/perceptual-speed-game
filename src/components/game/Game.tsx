import { useMachine } from '@xstate/react';
import { useGameOptions } from '@/store/gameOptions';
import { useHighScores } from '@/store/highScores';
import { GameIntro } from './GameIntro';
import { GameLeaderboard } from './GameLeaderboard';
import { GameOptions } from './GameOptions';
import { GamePlay } from './GamePlay';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { gameMachine } from './gameMachine';

export { COLS } from './gameMachine';

export default function Game() {
  const [state, send] = useMachine(gameMachine);
  const {
    rounds,
    answers,
    current,
    correct,
    elapsedMs,
    startedAt,
    mode,
    countTarget,
    timeLimitMs,
    letterSystem,
    mirrorX,
    mirrorY,
  } = state.context;

  const round = state.matches('playing') ? rounds[current] : null;

  /* Persist one record per unique option permutation when a run finishes. `startedAt` is unique per run, so the effect fires exactly once per completed game. */
  const recordedRunRef = useRef(0);
  useEffect(() => {
    if (!state.matches('results')) return;

    if (startedAt === 0 || recordedRunRef.current === startedAt) return;

    recordedRunRef.current = startedAt;
    useHighScores.getState().recordScore({
      mode,
      countTarget,
      timeLimitMs,
      letterSystem,
      mirrorX,
      mirrorY,
      correct,
      answered: answers.length,
      elapsedMs,
    });
  }, [
    state,
    startedAt,
    mode,
    countTarget,
    timeLimitMs,
    letterSystem,
    mirrorX,
    mirrorY,
    correct,
    answers.length,
    elapsedMs,
  ]);

  if (state.matches('intro')) {
    return (
      <GameIntro
        onStart={() =>
          send({ type: 'START', options: useGameOptions.getState() })
        }
        onOpenOptions={() => send({ type: 'OPEN_OPTIONS' })}
        onOpenLeaderboard={() => send({ type: 'OPEN_LEADERBOARD' })}
      />
    );
  }

  if (state.matches('playing') && round) {
    return (
      <GamePlay
        round={round}
        current={current}
        startedAt={startedAt}
        onAnswer={(n) => send({ type: 'ANSWER', value: n })}
        onAbort={() => send({ type: 'ABORT' })}
      />
    );
  }

  if (state.matches('options')) {
    return <GameOptions onBack={() => send({ type: 'BACK_TO_INTRO' })} />;
  }

  if (state.matches('results')) {
    return (
      <GameResults
        correct={correct}
        answered={answers.length}
        elapsedMs={elapsedMs}
        onRestart={() => send({ type: 'RESTART' })}
        onReview={() => send({ type: 'REVIEW' })}
        onOpenLeaderboard={() => send({ type: 'OPEN_LEADERBOARD' })}
      />
    );
  }

  if (state.matches('review')) {
    return (
      <GameReview
        rounds={rounds}
        answers={answers}
        onExit={() => send({ type: 'EXIT_REVIEW' })}
      />
    );
  }

  if (state.matches('leaderboard')) {
    return (
      <GameLeaderboard onBack={() => send({ type: 'CLOSE_LEADERBOARD' })} />
    );
  }

  return null;
}
