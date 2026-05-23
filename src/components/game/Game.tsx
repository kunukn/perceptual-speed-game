import { useMachine } from '@xstate/react';
import { useLocalStorage } from 'usehooks-ts';
import { GameIntro } from './GameIntro';
import { GameOptions } from './GameOptions';
import { GamePlay } from './GamePlay';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import {
  DEFAULT_OPTIONS,
  gameMachine,
  type GameOptions as GameOptionsType,
} from './gameMachine';

export { COLS } from './gameMachine';

export default function Game() {
  const [storedOptions, setStoredOptions] = useLocalStorage<GameOptionsType>(
    'perceptual-speed-options',
    DEFAULT_OPTIONS,
  );
  const [state, send] = useMachine(gameMachine, { input: storedOptions });
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
    showTimer,
    mirrorX,
    mirrorY,
    letterSystem,
  } = state.context;

  /* Mirror option changes from the machine back into localStorage. */
  useEffect(() => {
    setStoredOptions({
      mode,
      countTarget,
      timeLimitMs,
      showTimer,
      mirrorX,
      mirrorY,
      letterSystem,
    });
  }, [
    mode,
    countTarget,
    timeLimitMs,
    showTimer,
    mirrorX,
    mirrorY,
    letterSystem,
    setStoredOptions,
  ]);

  const round = state.matches('playing') ? rounds[current] : null;

  if (state.matches('intro')) {
    return (
      <GameIntro
        mode={mode}
        countTarget={countTarget}
        timeLimitMs={timeLimitMs}
        onStart={() => send({ type: 'START' })}
        onOpenOptions={() => send({ type: 'OPEN_OPTIONS' })}
      />
    );
  }

  if (state.matches('playing') && round) {
    return (
      <GamePlay
        round={round}
        current={current}
        countTarget={countTarget}
        mode={mode}
        showTimer={showTimer}
        mirrorX={mirrorX}
        mirrorY={mirrorY}
        startedAt={startedAt}
        onAnswer={(n) => send({ type: 'ANSWER', value: n })}
        onAbort={() => send({ type: 'ABORT' })}
      />
    );
  }

  if (state.matches('options')) {
    return (
      <GameOptions
        mode={mode}
        countTarget={countTarget}
        timeLimitMs={timeLimitMs}
        showTimer={showTimer}
        mirrorX={mirrorX}
        mirrorY={mirrorY}
        letterSystem={letterSystem}
        onModeChange={(m) => send({ type: 'SET_MODE', mode: m })}
        onCountTargetChange={(value) =>
          send({ type: 'SET_COUNT_TARGET', value })
        }
        onTimeLimitChange={(value) => send({ type: 'SET_TIME_LIMIT', value })}
        onShowTimerChange={(value) => send({ type: 'SET_SHOW_TIMER', value })}
        onMirrorXChange={(value) => send({ type: 'SET_MIRROR_X', value })}
        onMirrorYChange={(value) => send({ type: 'SET_MIRROR_Y', value })}
        onLetterSystemChange={(value) =>
          send({ type: 'SET_LETTER_SYSTEM', value })
        }
        onBack={() => send({ type: 'BACK_TO_INTRO' })}
      />
    );
  }

  if (state.matches('results')) {
    return (
      <GameResults
        mode={mode}
        correct={correct}
        total={mode === 'time' ? answers.length : countTarget}
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
