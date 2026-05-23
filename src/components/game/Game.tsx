import { useMachine } from '@xstate/react';
import { useGameOptions } from '@/store/gameOptions';
import { GameIntro } from './GameIntro';
import { GameOptions } from './GameOptions';
import { GamePlay } from './GamePlay';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { gameMachine } from './gameMachine';

export { COLS } from './gameMachine';

export default function Game() {
  const [state, send] = useMachine(gameMachine);
  const { rounds, answers, current, correct, elapsedMs, startedAt } =
    state.context;

  const round = state.matches('playing') ? rounds[current] : null;

  if (state.matches('intro')) {
    return (
      <GameIntro
        onStart={() =>
          send({ type: 'START', options: useGameOptions.getState() })
        }
        onOpenOptions={() => send({ type: 'OPEN_OPTIONS' })}
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

  return null;
}
